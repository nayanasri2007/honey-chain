from typing import Any


# Preferred operating ranges
TEMP_NORMAL_MIN = 32.0
TEMP_NORMAL_MAX = 36.0

HUMIDITY_NORMAL_MIN = 55.0
HUMIDITY_NORMAL_MAX = 75.0

ACTIVITY_HEALTHY_MIN = 70.0
ACTIVITY_REDUCED_MIN = 40.0


def analyze_hive_health(
    temperature: float,
    humidity: float,
    weight: float,
    bee_activity: float,
    previous_weight: float | None = None,
) -> dict[str, Any]:

    score = 100.0
    warnings = []

    # -------------------------
    # Temperature analysis
    # -------------------------
    if TEMP_NORMAL_MIN <= temperature <= TEMP_NORMAL_MAX:
        temperature_status = "Normal"

    elif 30.0 <= temperature < TEMP_NORMAL_MIN or TEMP_NORMAL_MAX < temperature <= 38.0:
        temperature_status = "Warning"
        score -= 10
        warnings.append("Temperature outside preferred range")

    else:
        temperature_status = "Critical"
        score -= 25
        warnings.append("Temperature is in a critical range")

    # -------------------------
    # Humidity analysis
    # -------------------------
    if HUMIDITY_NORMAL_MIN <= humidity <= HUMIDITY_NORMAL_MAX:
        humidity_status = "Normal"

    elif 50.0 <= humidity < HUMIDITY_NORMAL_MIN or HUMIDITY_NORMAL_MAX < humidity <= 80.0:
        humidity_status = "Warning"
        score -= 10
        warnings.append("Humidity outside preferred range")

    else:
        humidity_status = "Critical"
        score -= 20
        warnings.append("Humidity is in a critical range")

    # -------------------------
    # Bee activity analysis
    # -------------------------
    if bee_activity >= ACTIVITY_HEALTHY_MIN:
        activity_status = "Healthy"

    elif bee_activity >= ACTIVITY_REDUCED_MIN:
        activity_status = "Reduced"
        score -= 15
        warnings.append("Bee activity is reduced")

    else:
        activity_status = "Very Low"
        score -= 30
        warnings.append("Bee activity is very low")

    # -------------------------
    # Weight trend analysis
    # -------------------------
    if previous_weight is None:
        weight_status = "Stable"

    else:
        weight_change = weight - previous_weight

        if weight_change > 0.2:
            weight_status = "Increasing"

        elif weight_change < -0.2:
            weight_status = "Decreasing"
            score -= 10
            warnings.append("Hive weight is decreasing")

        else:
            weight_status = "Stable"

    # -------------------------
    # Additional combined-risk penalty
    # -------------------------
    abnormal_conditions = sum(
        [
            temperature_status != "Normal",
            humidity_status != "Normal",
            activity_status != "Healthy",
            weight_status == "Decreasing",
        ]
    )

    if abnormal_conditions >= 3:
        score -= 10
        warnings.append("Multiple hive conditions are outside preferred ranges")

    # Keep score between 0 and 100
    score = max(0.0, min(100.0, score))

    # -------------------------
    # Risk level
    # -------------------------
    if score >= 80:
        risk_level = "Low"
    elif score >= 60:
        risk_level = "Medium"
    elif score >= 40:
        risk_level = "High"
    else:
        risk_level = "Critical"

    # -------------------------
    # Recommendation
    # -------------------------
    if risk_level == "Low":
        recommendation = "Continue normal hive monitoring."

    elif risk_level == "Medium":
        recommendation = (
            "Monitor the hive more frequently and check environmental conditions."
        )

    elif risk_level == "High":
        recommendation = (
            "Inspect the hive soon and check colony activity, temperature, "
            "humidity, and food availability."
        )

    else:
        recommendation = (
            "Immediate hive inspection is recommended. Check colony condition "
            "and environmental/sensor conditions."
        )

    if not warnings:
        warnings.append(
            "All monitored parameters are within healthy operating ranges."
        )

    return {
        "health_score": round(score, 1),
        "risk_level": risk_level,
        "temperature_status": temperature_status,
        "humidity_status": humidity_status,
        "activity_status": activity_status,
        "weight_status": weight_status,
        "warning_factors": warnings,
        "recommendation": recommendation,
    }