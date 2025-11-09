import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional
from contextlib import contextmanager

# Database file path
DB_PATH = os.path.join(os.path.dirname(__file__), "leaderboard.db")


@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def init_database():
    """Initialize the database with the required schema."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Create detections table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                event_type TEXT NOT NULL,
                confidence REAL,
                image_path TEXT,
                caption TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create indexes for better query performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_username
            ON detections(username)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_event_type
            ON detections(event_type)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_timestamp
            ON detections(timestamp DESC)
        """)

        print("✓ Database initialized successfully")


def log_detection(
    username: str,
    event_type: str,
    confidence: Optional[float] = None,
    image_path: Optional[str] = None,
    caption: Optional[str] = None
) -> int:
    """
    Log a detection event to the database.

    Args:
        username: The user who triggered the detection
        event_type: Type of event (e.g., 'yawn', 'nose_picking', 'youtube')
        confidence: Detection confidence (0.0-1.0), optional
        image_path: Path to the detection image, optional
        caption: AI-generated caption, optional

    Returns:
        int: The ID of the inserted detection record
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO detections (username, event_type, confidence, image_path, caption)
            VALUES (?, ?, ?, ?, ?)
        """, (username, event_type, confidence, image_path, caption))

        detection_id = cursor.lastrowid
        print(f"✓ Logged detection #{detection_id}: {username} - {event_type}")
        return detection_id


def get_leaderboard(
    event_type: Optional[str] = None,
    limit: int = 10,
    days: Optional[int] = None
) -> List[Dict]:
    """
    Get leaderboard rankings.

    Args:
        event_type: Filter by specific event type (None = all events)
        limit: Maximum number of results to return
        days: Only include detections from last N days (None = all time)

    Returns:
        List of dicts with username, count, and avg_confidence
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        query = """
            SELECT
                username,
                COUNT(*) as detection_count,
                AVG(confidence) as avg_confidence,
                MAX(timestamp) as last_detected
            FROM detections
            WHERE 1=1
        """
        params = []

        if event_type:
            query += " AND event_type = ?"
            params.append(event_type)

        if days:
            query += " AND timestamp >= datetime('now', '-' || ? || ' days')"
            params.append(days)

        query += """
            GROUP BY username
            ORDER BY detection_count DESC, avg_confidence DESC
            LIMIT ?
        """
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [dict(row) for row in rows]


def get_user_stats(username: str) -> Dict:
    """
    Get detailed statistics for a specific user.

    Args:
        username: The username to get stats for

    Returns:
        Dict with total_detections, breakdown by event_type, and recent activity
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Total count
        cursor.execute("""
            SELECT COUNT(*) as total FROM detections WHERE username = ?
        """, (username,))
        total = cursor.fetchone()['total']

        # Breakdown by event type
        cursor.execute("""
            SELECT
                event_type,
                COUNT(*) as count,
                AVG(confidence) as avg_confidence
            FROM detections
            WHERE username = ?
            GROUP BY event_type
            ORDER BY count DESC
        """, (username,))
        breakdown = [dict(row) for row in cursor.fetchall()]

        # Recent detections (last 5)
        cursor.execute("""
            SELECT event_type, confidence, timestamp
            FROM detections
            WHERE username = ?
            ORDER BY timestamp DESC
            LIMIT 5
        """, (username,))
        recent = [dict(row) for row in cursor.fetchall()]

        return {
            "username": username,
            "total_detections": total,
            "breakdown": breakdown,
            "recent_activity": recent
        }


def get_event_types() -> List[str]:
    """
    Get all unique event types from the database.

    Returns:
        List of event type strings
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT event_type FROM detections ORDER BY event_type
        """)
        return [row['event_type'] for row in cursor.fetchall()]


def get_recent_detections(limit: int = 20) -> List[Dict]:
    """
    Get the most recent detections across all users.

    Args:
        limit: Maximum number of results

    Returns:
        List of detection records
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT username, event_type, confidence, timestamp
            FROM detections
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))
        return [dict(row) for row in cursor.fetchall()]


# Initialize database on module import
init_database()
