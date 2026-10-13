"""
RumorRadar Dataset Preparation Script
Downloads authentic FakeNewsNet benchmark data (PolitiFact subset)
from official repository: https://github.com/KaiDMML/FakeNewsNet
Parses ground-truth labels, headlines, URLs, and authentic social engagement (tweet_count).
"""

import csv
import os
import sys
import urllib.request
import re

# Increase CSV field size limit for large tweet_ids fields
csv.field_size_limit(2147483647)

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")
os.makedirs(DATASETS_DIR, exist_ok=True)

POLITIFACT_FAKE_URL = "https://raw.githubusercontent.com/KaiDMML/FakeNewsNet/master/dataset/politifact_fake.csv"
POLITIFACT_REAL_URL = "https://raw.githubusercontent.com/KaiDMML/FakeNewsNet/master/dataset/politifact_real.csv"

def download_and_parse(url, label_val, label_str):
    print(f"Fetching from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    records = []
    with urllib.request.urlopen(req) as resp:
        lines = resp.read().decode('utf-8', errors='replace').splitlines()
        reader = csv.reader(lines)
        header = next(reader, None)
        for row in reader:
            if not row or len(row) < 3:
                continue
            record_id = row[0].strip()
            news_url = row[1].strip()
            title = row[2].strip()
            
            # tweet_ids column contains tab-separated tweet IDs
            tweet_ids_str = row[3].strip() if len(row) > 3 else ""
            tweet_ids = [t for t in re.split(r'[\t\s,]+', tweet_ids_str) if t]
            tweet_count = len(tweet_ids)
            
            # Retweet / favorite approximations or social shares derived from tweet engagement
            # On Twitter / X, each tweet instance represents a social share event
            if title:
                records.append({
                    "id": record_id,
                    "title": title,
                    "news_url": news_url,
                    "tweet_count": tweet_count,
                    "label": label_val,
                    "label_name": label_str,
                    "dataset_source": "FakeNewsNet_PolitiFact"
                })
    print(f"Loaded {len(records)} records for label '{label_str}'.")
    return records

def main():
    try:
        fake_records = download_and_parse(POLITIFACT_FAKE_URL, 1, "fake")
        real_records = download_and_parse(POLITIFACT_REAL_URL, 0, "real")
    except Exception as e:
        print(f"Network error downloading FakeNewsNet: {e}")
        return

    all_records = fake_records + real_records
    
    # Save primary dataset with engagement features
    primary_csv = os.path.join(DATASETS_DIR, "fakenewsnet_politifact.csv")
    fieldnames = ["id", "title", "news_url", "tweet_count", "label", "label_name", "dataset_source"]
    
    with open(primary_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in all_records:
            writer.writerow(r)
            
    print(f"Successfully saved {len(all_records)} authentic records to {primary_csv}")
    
    # Also create a text-only dataset (no engagement column) to demonstrate & test
    # requirement 3: disabling engagement-dependent experiments when engagement is absent
    text_only_csv = os.path.join(DATASETS_DIR, "fakenewsnet_politifact_no_engagement.csv")
    text_fieldnames = ["id", "title", "news_url", "label", "label_name", "dataset_source"]
    with open(text_only_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=text_fieldnames)
        writer.writeheader()
        for r in all_records:
            writer.writerow({k: r[k] for k in text_fieldnames})
            
    print(f"Successfully saved text-only benchmark to {text_only_csv}")

if __name__ == "__main__":
    main()
