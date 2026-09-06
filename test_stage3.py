import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def req(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            if response.status == 204:
                return None
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTPError {e.code}: {e.read().decode('utf-8')}")
        raise e

def run_tests():
    print("--- STARTING STAGE 3 IoT TELEMETRY VERIFICATION TESTS ---")

    # 1. Health Check
    health = req("/health")
    print("1. Health Check Response:", health["status"])

    # 2. Get or Create Beekeeper
    bks = req("/beekeepers/")
    if len(bks) == 0:
        bk = req("/beekeepers/", method="POST", data={
            "beekeeper_code": "BK-2026-IOT-001",
            "name": "Kishan Singh",
            "phone": "+91 9988776655",
            "location": "Kullu, Himachal Pradesh"
        })
    else:
        bk = bks[0]
    print(f"2. Beekeeper: {bk['name']} (ID #{bk['id']})")

    # 3. Get or Create Hive
    hvs = req(f"/hives/?beekeeper_id={bk['id']}")
    if len(hvs) == 0:
        hv = req("/hives/", method="POST", data={
            "hive_code": "HV-2026-IOT-101",
            "beekeeper_id": bk["id"],
            "location": "Kullu Apiary Plot 1",
            "bee_species": "Apis mellifera"
        })
    else:
        hv = hvs[0]
    hive_id = hv["id"]
    print(f"3. Target Hive for IoT Telemetry: {hv['hive_code']} (ID #{hive_id})")

    # 4. Simulate Multiple IoT Sensor Readings
    print("4. Simulating 3 consecutive IoT sensor readings...")
    readings = []
    for i in range(3):
        r = req(f"/iot/hives/{hive_id}/simulate", method="POST")
        readings.append(r)
        print(f"   Reading #{i+1}: Temp={r['temperature']}°C ({r['temperature_status']}), Hum={r['humidity']}% ({r['humidity_status']}), Weight={r['weight']}kg ({r['weight_status']}), Activity={r['bee_activity']}% ({r['bee_activity_status']})")
        time.sleep(0.5)

    # 5. Verify Latest Reading API
    latest = req(f"/iot/hives/{hive_id}/latest")
    print(f"5. Latest Sensor Reading Payload ID #{latest['id']}: Temp={latest['temperature']}°C")
    assert latest["id"] == readings[-1]["id"]

    # 6. Verify Reading History API
    history = req(f"/iot/hives/{hive_id}/history?limit=10")
    print(f"6. Historical Readings Count: {len(history)} items retrieved.")
    assert len(history) >= 3

    # 7. Verify IoT Telemetry Overview API
    overview = req("/iot/overview")
    print("7. IoT Global Overview Summary:", overview)
    assert overview["total_hives"] >= 1
    assert overview["monitored_hives"] >= 1

    print("--- STAGE 3 IoT TELEMETRY VERIFICATION SUCCESSFUL! ---")

if __name__ == "__main__":
    run_tests()
