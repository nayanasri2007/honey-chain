import csv
from datetime import datetime
from pathlib import Path

from app.core.database import SessionLocal
from app.models.hive import Hive
from app.models.iot import HiveSensorReading


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

DATASET_PATH = (
    Path(__file__).resolve().parent
    / "dataset"
    / "madhusathya_hive_sensor_dataset.csv"
)


# ---------------------------------------------------------
# Import dataset
# ---------------------------------------------------------

def import_dataset():
    if not DATASET_PATH.exists():
        print(f"ERROR: Dataset not found:")
        print(DATASET_PATH)
        return

    db = SessionLocal()

    try:
        # -------------------------------------------------
        # Load existing hives
        # -------------------------------------------------

        hives = db.query(Hive).all()

        hive_map = {
            hive.hive_code: hive.id
            for hive in hives
        }

        print(f"Existing hives found: {len(hive_map)}")

        if not hive_map:
            print("ERROR: No hives found in the database.")
            print("Create the required hives before importing the dataset.")
            return

        # -------------------------------------------------
        # Read CSV
        # -------------------------------------------------

        with open(DATASET_PATH, "r", newline="", encoding="utf-8") as csv_file:

            reader = csv.DictReader(csv_file)

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
                print("ERROR: Dataset is missing columns:")
                for column in sorted(missing_columns):
                    print(f"  - {column}")
                return

            inserted = 0
            skipped = 0
            missing_hives = set()

            # -------------------------------------------------
            # Import every row
            # -------------------------------------------------

            for row in reader:

                hive_code = row["hive_code"].strip()

                # ---------------------------------------------
                # Find hive
                # ---------------------------------------------

                hive_id = hive_map.get(hive_code)

                if hive_id is None:
                    missing_hives.add(hive_code)
                    skipped += 1
                    continue

                # ---------------------------------------------
                # Convert timestamp
                # ---------------------------------------------

                timestamp = datetime.fromisoformat(
                    row["timestamp"]
                )

                # ---------------------------------------------
                # Prevent duplicates
                # ---------------------------------------------

                existing = (
                    db.query(HiveSensorReading)
                    .filter(
                        HiveSensorReading.hive_id == hive_id,
                        HiveSensorReading.timestamp == timestamp,
                    )
                    .first()
                )

                if existing:
                    skipped += 1
                    continue

                # ---------------------------------------------
                # Create sensor reading
                # ---------------------------------------------

                reading = HiveSensorReading(
                    hive_id=hive_id,
                    temperature=float(row["temperature_c"]),
                    humidity=float(row["humidity_pct"]),
                    weight=float(row["hive_weight_kg"]),
                    bee_activity=float(row["bee_activity_score"]),
                    timestamp=timestamp,
                )

                db.add(reading)
                inserted += 1

                # Commit periodically so the transaction
                # does not become unnecessarily large.
                if inserted % 500 == 0:
                    db.commit()
                    print(f"Inserted {inserted} records...")

            # -------------------------------------------------
            # Final commit
            # -------------------------------------------------

            db.commit()

            print()
            print("=" * 60)
            print("MADHUSATHYA DATASET IMPORT COMPLETE")
            print("=" * 60)
            print(f"Inserted records : {inserted}")
            print(f"Skipped records  : {skipped}")

            if missing_hives:
                print()
                print("WARNING: These hive codes were not found:")
                for hive_code in sorted(missing_hives):
                    print(f"  - {hive_code}")

            print("=" * 60)

    except Exception as error:
        db.rollback()

        print()
        print("=" * 60)
        print("DATASET IMPORT FAILED")
        print("=" * 60)
        print(error)
        print("=" * 60)

        raise

    finally:
        db.close()


# ---------------------------------------------------------
# Run importer
# ---------------------------------------------------------

if __name__ == "__main__":
    import_dataset()