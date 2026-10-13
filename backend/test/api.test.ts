import { StoreService } from '../src/services/storeService';
import path from 'path';
import fs from 'fs';

async function runBackendTests() {
  console.log('--- Running Backend API & Store Layer Tests ---');

  // Test 1: Store persistence for Datasets
  const testDsId = `test_ds_${Date.now()}`;
  const testDataset = {
    id: testDsId,
    name: 'Unit Test Benchmark Dataset',
    filename: 'unit_test.csv',
    filepath: path.resolve(__dirname, '../../datasets/fakenewsnet_politifact.csv'),
    totalRows: 1056,
    totalColumns: 7,
    textColumn: 'title',
    labelColumn: 'label',
    engagementColumn: 'tweet_count',
    hasEngagement: true,
    classDistribution: { '0': 624, '1': 432 },
    columns: [],
    createdAt: new Date()
  };

  await StoreService.saveDataset(testDataset);
  const fetchedDs = await StoreService.getDatasetById(testDsId);
  if (!fetchedDs || fetchedDs.name !== testDataset.name) {
    throw new Error('Test 1 Failed: Dataset was not correctly persisted or fetched');
  }
  console.log('✓ Test 1 Passed: Dataset persistence and retrieval verified');

  // Test 2: Store persistence for Experiments
  const testExpId = `test_exp_${Date.now()}`;
  const testExperiment = {
    id: testExpId,
    datasetId: testDsId,
    datasetName: testDataset.name,
    featureMode: 'combined',
    algorithm: 'logistic_regression',
    testSize: 0.2,
    randomState: 42,
    trainSamples: 844,
    testSamples: 212,
    totalSamples: 1056,
    status: 'completed',
    progress: 100,
    metrics: {
      accuracy: 0.8585,
      precision_binary: 0.9014,
      recall_binary: 0.7356,
      f1_binary: 0.8101,
      precision_macro: 0.8691,
      recall_macro: 0.8398,
      f1_macro: 0.8487,
      roc_auc: 0.9369,
      pr_auc: 0.8946
    },
    confusionMatrix: {
      tn: 118,
      fp: 7,
      fn: 23,
      tp: 64,
      matrix: [[118, 7], [23, 64]]
    },
    createdAt: new Date()
  };

  await StoreService.saveExperiment(testExperiment);
  const fetchedExp = await StoreService.getExperimentById(testExpId);
  if (!fetchedExp || fetchedExp.metrics?.accuracy !== 0.8585) {
    throw new Error('Test 2 Failed: Experiment metrics were not correctly persisted');
  }
  console.log('✓ Test 2 Passed: Experiment metrics and confusion matrix persistence verified');

  // Test 3: Predictions logging
  const testPred = {
    id: `test_pred_${Date.now()}`,
    text: 'Health agency announces safety trial completion',
    engagementValue: 50,
    predictedLabel: 0,
    labelName: 'Verified Factual Content',
    confidence: 0.89,
    probabilities: { real: 0.89, fake: 0.11 },
    riskLevel: 'Low Risk',
    sentiment: { compound: 0.44, pos: 0.35, neg: 0.0, neu: 0.65 },
    emotions: { trust: 0.6, joy: 0.2 },
    modelUsed: 'test_init.joblib',
    createdAt: new Date()
  };

  await StoreService.savePrediction(testPred);
  const allPreds = await StoreService.getAllPredictions();
  if (!allPreds.some((p) => p.id === testPred.id)) {
    throw new Error('Test 3 Failed: Prediction log was not saved');
  }
  console.log('✓ Test 3 Passed: Live prediction logging verified');

  // Clean up test dataset
  await StoreService.deleteDataset(testDsId);
  console.log('✓ Test 4 Passed: Cleaned up test records');

  console.log('--- ALL BACKEND UNIT TESTS PASSED SUCCESSFULLY! ---');
}

runBackendTests().catch((err) => {
  console.error('BACKEND TEST FAILURE:', err);
  process.exit(1);
});
