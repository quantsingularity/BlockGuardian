"""
Comprehensive monitoring and metrics system for BlockGuardian Backend
Implements real-time monitoring, performance tracking, and alerting
"""

import logging
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, List

import psutil
from flask import g
from src.models.base import db_manager
from src.security.audit import audit_logger


@dataclass
class MetricPoint:
    """Individual metric data point"""

    timestamp: datetime
    value: float
    tags: Dict[str, str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp.isoformat(),
            "value": self.value,
            "tags": self.tags or {},
        }


class MetricsCollector:
    """Centralized metrics collection and storage"""

    def __init__(self, max_points_per_metric: int = 1000):
        self.metrics = defaultdict(lambda: deque(maxlen=max_points_per_metric))
        self.counters = defaultdict(int)
        self.gauges = defaultdict(float)
        self.histograms = defaultdict(list)
        self.lock = threading.Lock()

        # Start background collection
        self.collection_thread = threading.Thread(
            target=self._collect_system_metrics, daemon=True
        )
        self.collection_thread.start()

    def record_counter(self, name: str, value: float = 1, tags: Dict[str, str] = None):
        """Record a counter metric"""
        with self.lock:
            self.counters[name] += value
            self.metrics[name].append(MetricPoint(datetime.utcnow(), value, tags))

    def record_gauge(self, name: str, value: float, tags: Dict[str, str] = None):
        """Record a gauge metric"""
        with self.lock:
            self.gauges[name] = value
            self.metrics[name].append(MetricPoint(datetime.utcnow(), value, tags))

    def record_histogram(self, name: str, value: float, tags: Dict[str, str] = None):
        """Record a histogram metric"""
        with self.lock:
            self.histograms[name].append(value)
            self.metrics[name].append(MetricPoint(datetime.utcnow(), value, tags))

    def record_timing(self, name: str, duration_ms: float, tags: Dict[str, str] = None):
        """Record a timing metric"""
        self.record_histogram(f"{name}.duration_ms", duration_ms, tags)

    def get_metric_summary(self, name: str, minutes: int = 60) -> Dict[str, Any]:
        """Get summary statistics for a metric"""
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)

        with self.lock:
            recent_points = [
                point for point in self.metrics[name] if point.timestamp >= cutoff_time
            ]

        if not recent_points:
            return {"count": 0, "min": 0, "max": 0, "avg": 0, "sum": 0}

        values = [point.value for point in recent_points]

        return {
            "count": len(values),
            "min": min(values),
            "max": max(values),
            "avg": sum(values) / len(values),
            "sum": sum(values),
            "latest": values[-1] if values else 0,
        }

    def get_all_metrics(self, minutes: int = 60) -> Dict[str, Any]:
        """Get all metrics summaries"""
        result = {}

        with self.lock:
            metric_names = list(self.metrics.keys())

        for name in metric_names:
            result[name] = self.get_metric_summary(name, minutes)

        # Add current counters and gauges
        result["counters"] = dict(self.counters)
        result["gauges"] = dict(self.gauges)

        return result

    def _collect_system_metrics(self):
        """Background thread to collect system metrics"""
        while True:
            try:
                # CPU metrics
                cpu_percent = psutil.cpu_percent(interval=1)
                self.record_gauge("system.cpu.percent", cpu_percent)

                # Memory metrics
                memory = psutil.virtual_memory()
                self.record_gauge("system.memory.percent", memory.percent)
                self.record_gauge("system.memory.used_mb", memory.used / 1024 / 1024)
                self.record_gauge(
                    "system.memory.available_mb", memory.available / 1024 / 1024
                )

                # Disk metrics
                disk = psutil.disk_usage("/")
                self.record_gauge("system.disk.percent", disk.percent)
                self.record_gauge("system.disk.used_gb", disk.used / 1024 / 1024 / 1024)
                self.record_gauge("system.disk.free_gb", disk.free / 1024 / 1024 / 1024)

                # Network metrics
                network = psutil.net_io_counters()
                self.record_counter("system.network.bytes_sent", network.bytes_sent)
                self.record_counter("system.network.bytes_recv", network.bytes_recv)

                # Process metrics
                process = psutil.Process()
                self.record_gauge("process.cpu.percent", process.cpu_percent())
                self.record_gauge(
                    "process.memory.rss_mb", process.memory_info().rss / 1024 / 1024
                )
                self.record_gauge("process.threads.count", process.num_threads())

                time.sleep(60)  # Collect every minute

            except Exception as e:
                logging.error(f"Error collecting system metrics: {str(e)}")
                time.sleep(60)


class PerformanceMonitor:
    """Performance monitoring for API endpoints and database operations"""

    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
        self.slow_query_threshold = 1000  # ms
        self.slow_request_threshold = 5000  # ms

    def start_request_timing(self):
        """Start timing a request"""
        g.request_start_time = time.time()

    def end_request_timing(self, endpoint: str, method: str, status_code: int):
        """End timing a request and record metrics"""
        if not hasattr(g, "request_start_time"):
            return

        duration_ms = (time.time() - g.request_start_time) * 1000

        # Record request metrics
        tags = {"endpoint": endpoint, "method": method, "status_code": str(status_code)}

        self.metrics.record_counter("api.requests.total", 1, tags)
        self.metrics.record_timing("api.requests", duration_ms, tags)

        # Record slow requests
        if duration_ms > self.slow_request_threshold:
            self.metrics.record_counter("api.requests.slow", 1, tags)

            # Log slow request
            audit_logger.log_performance_event(
                event_type="slow_request",
                details={
                    "endpoint": endpoint,
                    "method": method,
                    "duration_ms": duration_ms,
                    "threshold_ms": self.slow_request_threshold,
                },
            )

        # Record status code metrics
        if status_code >= 400:
            self.metrics.record_counter("api.errors.total", 1, tags)

            if status_code >= 500:
                self.metrics.record_counter("api.errors.server", 1, tags)
            else:
                self.metrics.record_counter("api.errors.client", 1, tags)

    def record_database_query(
        self, query_type: str, duration_ms: float, table: str = None
    ):
        """Record database query performance"""
        tags = {"query_type": query_type}
        if table:
            tags["table"] = table

        self.metrics.record_timing("database.queries", duration_ms, tags)
        self.metrics.record_counter("database.queries.total", 1, tags)

        # Record slow queries
        if duration_ms > self.slow_query_threshold:
            self.metrics.record_counter("database.queries.slow", 1, tags)

            # Log slow query
            audit_logger.log_performance_event(
                event_type="slow_query",
                details={
                    "query_type": query_type,
                    "table": table,
                    "duration_ms": duration_ms,
                    "threshold_ms": self.slow_query_threshold,
                },
            )

    def record_business_metric(
        self, metric_name: str, value: float, tags: Dict[str, str] = None
    ):
        """Record business-specific metrics"""
        self.metrics.record_gauge(f"business.{metric_name}", value, tags)


class AlertManager:
    """Alert management system for monitoring thresholds"""

    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
        self.alert_rules = []
        self.alert_history = deque(maxlen=1000)
        self.alert_cooldowns = {}  # Prevent alert spam

        # Default alert rules
        self._setup_default_alerts()

    def _setup_default_alerts(self):
        """Set up default alert rules"""
        self.add_alert_rule(
            name="high_cpu_usage",
            metric="system.cpu.percent",
            threshold=80,
            comparison="greater_than",
            duration_minutes=5,
            severity="warning",
        )

        self.add_alert_rule(
            name="high_memory_usage",
            metric="system.memory.percent",
            threshold=85,
            comparison="greater_than",
            duration_minutes=5,
            severity="warning",
        )

        self.add_alert_rule(
            name="high_error_rate",
            metric="api.errors.total",
            threshold=10,
            comparison="greater_than",
            duration_minutes=5,
            severity="critical",
        )

        self.add_alert_rule(
            name="database_connection_errors",
            metric="database.errors.connection",
            threshold=1,
            comparison="greater_than",
            duration_minutes=1,
            severity="critical",
        )

    def add_alert_rule(
        self,
        name: str,
        metric: str,
        threshold: float,
        comparison: str,
        duration_minutes: int,
        severity: str,
    ):
        """Add a new alert rule"""
        rule = {
            "name": name,
            "metric": metric,
            "threshold": threshold,
            "comparison": comparison,
            "duration_minutes": duration_minutes,
            "severity": severity,
            "enabled": True,
        }
        self.alert_rules.append(rule)

    def check_alerts(self):
        """Check all alert rules and trigger alerts if necessary"""
        current_time = datetime.utcnow()

        for rule in self.alert_rules:
            if not rule["enabled"]:
                continue

            # Check if alert is in cooldown
            cooldown_key = rule["name"]
            if cooldown_key in self.alert_cooldowns:
                if current_time < self.alert_cooldowns[cooldown_key]:
                    continue

            # Get metric data
            metric_summary = self.metrics.get_metric_summary(
                rule["metric"], rule["duration_minutes"]
            )

            if not metric_summary or metric_summary["count"] == 0:
                continue

            # Check threshold
            value = metric_summary["avg"]  # Use average value
            threshold_exceeded = False

            if rule["comparison"] == "greater_than":
                threshold_exceeded = value > rule["threshold"]
            elif rule["comparison"] == "less_than":
                threshold_exceeded = value < rule["threshold"]
            elif rule["comparison"] == "equals":
                threshold_exceeded = value == rule["threshold"]

            if threshold_exceeded:
                self._trigger_alert(rule, value, metric_summary)

                # Set cooldown (5 minutes for warnings, 15 minutes for critical)
                cooldown_minutes = 15 if rule["severity"] == "critical" else 5
                self.alert_cooldowns[cooldown_key] = current_time + timedelta(
                    minutes=cooldown_minutes
                )

    def _trigger_alert(
        self, rule: Dict[str, Any], current_value: float, metric_summary: Dict[str, Any]
    ):
        """Trigger an alert"""
        alert = {
            "timestamp": datetime.utcnow(),
            "rule_name": rule["name"],
            "metric": rule["metric"],
            "severity": rule["severity"],
            "threshold": rule["threshold"],
            "current_value": current_value,
            "comparison": rule["comparison"],
            "metric_summary": metric_summary,
        }

        self.alert_history.append(alert)

        # Log alert
        audit_logger.log_security_alert(
            alert_type=f"monitoring_alert_{rule['severity']}", details=alert
        )

        # Send notifications (implement based on requirements)
        self._send_alert_notification(alert)

    def _send_alert_notification(self, alert: Dict[str, Any]):
        """Send alert notification (placeholder for actual implementation)"""
        # This would integrate with email, Slack, PagerDuty, etc.
        logging.warning(
            f"ALERT: {alert['rule_name']} - {alert['metric']} = {alert['current_value']} (threshold: {alert['threshold']})"
        )

    def get_active_alerts(self, severity: str = None) -> List[Dict[str, Any]]:
        """Get currently active alerts"""
        cutoff_time = datetime.utcnow() - timedelta(hours=1)

        active_alerts = [
            alert for alert in self.alert_history if alert["timestamp"] >= cutoff_time
        ]

        if severity:
            active_alerts = [
                alert for alert in active_alerts if alert["severity"] == severity
            ]

        return active_alerts


class HealthChecker:
    """System health checking and reporting"""

    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
        self.health_checks = {}

        # Register default health checks
        self._register_default_checks()

    def _register_default_checks(self):
        """Register default health checks"""
        self.register_check("database", self._check_database)
        self.register_check("redis", self._check_redis)
        self.register_check("disk_space", self._check_disk_space)
        self.register_check("memory", self._check_memory)
        self.register_check("cpu", self._check_cpu)

    def register_check(self, name: str, check_function):
        """Register a health check function"""
        self.health_checks[name] = check_function

    def run_health_checks(self) -> Dict[str, Any]:
        """Run all health checks and return results"""
        results = {
            "timestamp": datetime.utcnow().isoformat(),
            "overall_status": "healthy",
            "checks": {},
        }

        for name, check_function in self.health_checks.items():
            try:
                check_result = check_function()
                results["checks"][name] = check_result

                # Update overall status
                if check_result["status"] != "healthy":
                    if check_result["status"] == "critical":
                        results["overall_status"] = "critical"
                    elif results["overall_status"] == "healthy":
                        results["overall_status"] = "warning"

            except Exception as e:
                results["checks"][name] = {
                    "status": "critical",
                    "message": f"Health check failed: {str(e)}",
                    "timestamp": datetime.utcnow().isoformat(),
                }
                results["overall_status"] = "critical"

        return results

    def _check_database(self) -> Dict[str, Any]:
        """Check database connectivity"""
        try:
            session = db_manager.get_session()
            session.execute("SELECT 1")
            session.close()

            return {
                "status": "healthy",
                "message": "Database connection successful",
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {
                "status": "critical",
                "message": f"Database connection failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat(),
            }

    def _check_redis(self) -> Dict[str, Any]:
        """Check Redis connectivity"""
        try:
            # This would check Redis if configured
            return {
                "status": "healthy",
                "message": "Redis not configured",
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {
                "status": "warning",
                "message": f"Redis check failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat(),
            }

    def _check_disk_space(self) -> Dict[str, Any]:
        """Check available disk space"""
        try:
            disk = psutil.disk_usage("/")
            free_percent = (disk.free / disk.total) * 100

            if free_percent < 10:
                status = "critical"
                message = f"Low disk space: {free_percent:.1f}% free"
            elif free_percent < 20:
                status = "warning"
                message = f"Disk space warning: {free_percent:.1f}% free"
            else:
                status = "healthy"
                message = f"Disk space OK: {free_percent:.1f}% free"

            return {
                "status": status,
                "message": message,
                "free_percent": free_percent,
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {
                "status": "critical",
                "message": f"Disk space check failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat(),
            }

    def _check_memory(self) -> Dict[str, Any]:
        """Check memory usage"""
        try:
            memory = psutil.virtual_memory()

            if memory.percent > 90:
                status = "critical"
                message = f"High memory usage: {memory.percent:.1f}%"
            elif memory.percent > 80:
                status = "warning"
                message = f"Memory usage warning: {memory.percent:.1f}%"
            else:
                status = "healthy"
                message = f"Memory usage OK: {memory.percent:.1f}%"

            return {
                "status": status,
                "message": message,
                "usage_percent": memory.percent,
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {
                "status": "critical",
                "message": f"Memory check failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat(),
            }

    def _check_cpu(self) -> Dict[str, Any]:
        """Check CPU usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)

            if cpu_percent > 90:
                status = "critical"
                message = f"High CPU usage: {cpu_percent:.1f}%"
            elif cpu_percent > 80:
                status = "warning"
                message = f"CPU usage warning: {cpu_percent:.1f}%"
            else:
                status = "healthy"
                message = f"CPU usage OK: {cpu_percent:.1f}%"

            return {
                "status": status,
                "message": message,
                "usage_percent": cpu_percent,
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            return {
                "status": "critical",
                "message": f"CPU check failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat(),
            }


# Global instances
metrics_collector = MetricsCollector()
performance_monitor = PerformanceMonitor(metrics_collector)
alert_manager = AlertManager(metrics_collector)
health_checker = HealthChecker(metrics_collector)


# Background alert checking
def start_alert_monitoring():
    """Start background alert monitoring"""

    def alert_loop():
        while True:
            try:
                alert_manager.check_alerts()
                time.sleep(60)  # Check every minute
            except Exception as e:
                logging.error(f"Error in alert monitoring: {str(e)}")
                time.sleep(60)

    alert_thread = threading.Thread(target=alert_loop, daemon=True)
    alert_thread.start()


# Initialize monitoring
start_alert_monitoring()
