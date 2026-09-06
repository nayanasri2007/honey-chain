import urllib.request
import json

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
    print("--- STARTING STAGE 2 API VERIFICATION TESTS ---")

    # 1. Health Check
    health = req("/health")
    print("1. Health Check Response:", health)
    assert health["status"] == "online"

    # 2. Register Beekeeper 1
    bk_data = {
        "beekeeper_code": "BK-2026-TEST-001",
        "name": "Ramesh Kumar",
        "phone": "+91 9876543210",
        "location": "Shimla Valley, Himachal Pradesh",
        "status": "active"
    }
    bk1 = req("/beekeepers/", method="POST", data=bk_data)
    print("2. Created Beekeeper:", bk1)
    bk_id = bk1["id"]

    # 3. List Beekeepers
    bk_list = req("/beekeepers/")
    print(f"3. Listed {len(bk_list)} Beekeepers.")

    # 4. Register Hive 1 under Beekeeper 1
    hv1_data = {
        "hive_code": "HV-2026-TEST-001",
        "beekeeper_id": bk_id,
        "location": "North Apiary Sector A",
        "bee_species": "Apis mellifera",
        "status": "active"
    }
    hv1 = req("/hives/", method="POST", data=hv1_data)
    print("4. Created Hive 1:", hv1)

    # 5. Register Hive 2 under Beekeeper 1
    hv2_data = {
        "hive_code": "HV-2026-TEST-002",
        "beekeeper_id": bk_id,
        "location": "South Apiary Sector B",
        "bee_species": "Apis cerana",
        "status": "active"
    }
    hv2 = req("/hives/", method="POST", data=hv2_data)
    print("5. Created Hive 2:", hv2)

    # 6. Retrieve Beekeeper details with nested hives
    bk_detail = req(f"/beekeepers/{bk_id}")
    print(f"6. Beekeeper Detail with Hives (Count: {len(bk_detail['hives'])}):", bk_detail["name"])
    assert len(bk_detail["hives"]) == 2

    # 7. Update Hive 1 status to maintenance
    updated_hv1 = req(f"/hives/{hv1['id']}", method="PUT", data={"status": "maintenance"})
    print("7. Updated Hive 1 Status:", updated_hv1["status"])
    assert updated_hv1["status"] == "maintenance"

    # 8. Delete Hive 2
    req(f"/hives/{hv2['id']}", method="DELETE")
    print("8. Deleted Hive 2 successfully.")

    # 9. Verify Beekeeper hives count after deletion
    bk_detail_after = req(f"/beekeepers/{bk_id}")
    print(f"9. Beekeeper Hives Count after deletion:", len(bk_detail_after["hives"]))
    assert len(bk_detail_after["hives"]) == 1

    print("--- STAGE 2 API VERIFICATION SUCCESSFUL! ---")

if __name__ == "__main__":
    run_tests()
