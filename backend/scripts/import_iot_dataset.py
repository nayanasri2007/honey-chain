import csv
import os
import sys
from datetime import datetime

# Allow this script to import modules from the backend/app directory
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, BACKEND_DIR)

from app.core.database import SessionLocal
from app.models.hive import Hive
from app.models.iot import HiveSensorReading


# ---------------------------------------------------------
# Dataset location
# ---------------------------------------------------------

CSV_FILE = os.path.abspath(
    os.path.join(
        BACKEND_DIR,
        "dataset",
        "madhusathya_hive_sensor_dataset.csv"
    )
)


# ---------------------------------------------------------
# Import function
# ---------------------------------------------------------

def import_dataset():
    if not os.path.exists(CSV_FILE):
        print(f"\nERROR: Dataset not found:")
        print(CSV_FILE)
        print("\nPut the CSV file in the project root folder.")
        return

    db = SessionLocal()

    try:
        print("\n==============================================")
        print(" MadhuSathya IoT Dataset Import")
        print("==============================================")
        print(f"Dataset: {CSV_FILE}\n")

        # -------------------------------------------------
        # Find prototype hives
        # -------------------------------------------------

        hives = (
            db.query(Hive)
            .filter(Hive.hive_code.like("HV-2026-%"))
            .all()
        )

        hive_map = {
            hive.hive_code: hive
            for hive in hives
        }

        print(f"Hives found in database: {len(hive_map)}")

        if not hive_map:
            print("\nERROR: No HV-2026 hives were found.")
            print("Please register the hives before importing the dataset.")
            return

        # -------------------------------------------------
        # Check existing readings
        # -------------------------------------------------

        existing_count = db.query(HiveSensorReading).count()

        print(f"Existing sensor readings: {existing_count}")

        if existing_count > 0:
            print("\nWARNING:")
            print("Sensor readings already exist in the database.")
            print("The import will be skipped to prevent duplicates.")
            print("\nIf you intentionally want to re-import the dataset,")
            print("we can clear the prototype readings first.")
            return

        # -------------------------------------------------
        # Read CSV
        # -------------------------------------------------

        imported = 0
        skipped = 0

        with open(CSV_FILE, "r", newline="", encoding="utf-8-sig") as file:
            reader = csv.DictReader(file)

            required_columns = {
                "timestamp",
                "hive_code",
                "temperature_c",
                "humidity_pct",
                "hive_weight_kg",
                "bee_activity_score",
            }

            missing_columns = required_columns - set(reader.fieldnames or [])

            if missing_columns:
                print("\nERROR: Missing CSV columns:")
                for column in missing_columns:
                    print(f"  - {column}")
                return

            for row_number, row in enumerate(reader, start=2):

                hive_code = row["hive_code"].strip()

                hive = hive_map.get(hive_code)

                if not hive:
                    skipped += 1
                    print(
                        f"Skipping row {row_number}: "
                        f"Hive '{hive_code}' not found."
                    )
                    continue

                try:
                    timestamp = datetime.fromisoformat(
                        row["timestamp"].strip()
                    )

                    temperature = float(row["temperature_c"])
                    humidity = float(row["humidity_pct"])
                    weight = float(row["hive_weight_kg"])
                    bee_activity = float(row["bee_activity_score"])

                    reading = HiveSensorReading(
                        hive_id=hive.id,
                        temperature=temperature,
                        humidity=humidity,
                        weight=weight,
                        bee_activity=bee_activity,
                        timestamp=timestamp,
                    )

                    db.add(reading)
                    imported += 1

                except Exception as row_error:
                    skipped += 1
                    print(
                        f"Skipping row {row_number}: {row_error}"
                    )

                # Commit periodically so a huge import doesn't
                # remain in one transaction.
                if imported > 0 and imported % 500 == 0:
                    db.commit()
                    print(f"Imported {imported} readings...")

        # Final commit
        db.commit()

        print("\n==============================================")
        print(" IMPORT COMPLETE")
        print("==============================================")
        print(f"Imported readings : {imported}")
        print(f"Skipped readings  : {skipped}")

        # -------------------------------------------------
        # Verify import
        # -------------------------------------------------

        print("\nReadings per hive:")

        for hive_code, hive in sorted(hive_map.items()):
            count = (
                db.query(HiveSensorReading)
                .filter(HiveSensorReading.hive_id == hive.id)
                .count()
            )

            print(f"  {hive_code}: {count}")

        print("\nDataset import finished successfully.")

    except Exception as error:
        db.rollback()

        print("\n==============================================")
        print(" IMPORT FAILED")
        print("==============================================")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    import_dataset()