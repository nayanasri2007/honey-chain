import random
from datetime import datetime
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseIoTAdapter(ABC):
    """
    Abstract IoT Data Source Adapter Interface.
    Designed so future hardware adapters (e.g. ESP32 / MQTT / LoRaWAN) can seamlessly drop in.
    """
    @abstractmethod
    def generate_reading(self, hive_id: int, last_reading: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        pass

class SimulatorAdapter(BaseIoTAdapter):
    """
    Realistic IoT Hive Sensor Simulator.
    Simulates temperature, humidity, gradual weight drift, and bee activity.
    """
    def generate_reading(self, hive_id: int, last_reading: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if last_reading:
            # Gradual weight drift from previous weight
            last_weight = last_reading.get("weight", 45.0)
            weight_delta = random.uniform(-0.3, 0.4)
            weight = max(20.0, min(70.0, round(last_weight + weight_delta, 2)))

            # Temperature variation from previous reading
            last_temp = last_reading.get("temperature", 34.0)
            temp_delta = random.uniform(-0.8, 0.8)
            temperature = max(30.0, min(38.5, round(last_temp + temp_delta, 1)))

            # Humidity variation
            last_hum = last_reading.get("humidity", 62.0)
            hum_delta = random.uniform(-2.0, 2.0)
            humidity = max(50.0, min(80.0, round(last_hum + hum_delta, 1)))

            # Bee activity
            last_act = last_reading.get("bee_activity", 85.0)
            act_delta = random.uniform(-5.0, 5.0)
            bee_activity = max(40.0, min(98.0, round(last_act + act_delta, 1)))
        else:
            # First initial reading for new hive
            temperature = round(random.uniform(33.0, 36.0), 1)
            humidity = round(random.uniform(58.0, 70.0), 1)
            weight = round(random.uniform(35.0, 55.0), 2)
            bee_activity = round(random.uniform(75.0, 92.0), 1)

        return {
            "hive_id": hive_id,
            "temperature": temperature,
            "humidity": humidity,
            "weight": weight,
            "bee_activity": bee_activity,
            "timestamp": datetime.utcnow()
        }

# Factory instance for current system
iot_data_source: BaseIoTAdapter = SimulatorAdapter()
