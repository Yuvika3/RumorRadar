# RumorRadar Datasets Specification

## 1. Primary Dataset: FakeNewsNet (PolitiFact Subset)
- **Repository**: [https://github.com/KaiDMML/FakeNewsNet](https://github.com/KaiDMML/FakeNewsNet)
- **Reference**: Kai Shu, Deepak Mahudeswaran, Suhang Wang, and Huan Liu. *"FakeNewsNet: A Data Repository with News Content, Social Context and Spatiotemporal Information for Studying Fake News on Social Media"*, Big Data 2020 / ACM KDD.
- **Ground Truth Source**: Professional fact-checking journalists at [PolitiFact](https://www.politifact.com/).
- **Label Semantics**:
  - `0` (`real`): Fact-checked as verified factual journalism.
  - `1` (`fake`): Fact-checked as false, fabrication, or rumor.
- **File**: `datasets/fakenewsnet_politifact.csv` (1,056 records: 624 real, 432 fake).
- **Attributes**:
  - `id`: Unique claim identifier from FakeNewsNet.
  - `title`: News headline / claim text.
  - `news_url`: Original publication URL.
  - `tweet_count`: Volume of Twitter/X sharing events associated with the story (genuine social engagement measure).
  - `label`: Integer ground truth (`0` or `1`).
  - `label_name`: Human-readable label (`real` or `fake`).
  - `dataset_source`: Data origin tag.

## 2. Text-Only Benchmark: FakeNewsNet (No Engagement)
- **File**: `datasets/fakenewsnet_politifact_no_engagement.csv`
- **Purpose**: Explicitly testing system behavior and graceful degradation when engagement fields are unavailable.
- **System Behavior**: RumorRadar detects the absence of engagement fields, disables engagement-dependent experiments ("Text + Engagement", "Multimodal Fusion"), and displays informative disclaimers in the UI.

## 3. FactDrill Research Comparison
- **Paper**: Shahan Ali Memon et al. *"FactDrill: An Interactive Information Drill for Fact-Checking and Social Media Analysis"*, ICWSM 2022 ([AAAI ICWSM Article](https://ojs.aaai.org/index.php/ICWSM/article/view/19384)).
- FactDrill aggregates fact-checks from Snopes and PolitiFact. The FactDrill study corroborates that emotional charge and resharing dynamics vary significantly between debunked claims and verified claims, but warns against simplistic assumptions (e.g. anger != fake).
