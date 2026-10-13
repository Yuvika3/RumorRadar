import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Dataset } from '../types';
import {
  Database,
  Search,
  Filter,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Share2,
  Info,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const DataExplorerPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [rows, setRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const [search, setSearch] = useState<string>('');
  const [labelFilter, setLabelFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [textCol, setTextCol] = useState('title');
  const [labelCol, setLabelCol] = useState('label');
  const [engCol, setEngCol] = useState('tweet_count');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadDatasets = async () => {
    try {
      const list = await api.getDatasets();
      setDatasets(list);
      if (list.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadRows = async () => {
    if (!selectedDatasetId) return;
    setLoading(true);
    try {
      const res = await api.getDatasetRows(selectedDatasetId, {
        page,
        limit,
        search,
        label: labelFilter
      });
      setRows(res.rows || []);
      setTotalRows(res.totalRows || 0);
    } catch (err) {
      console.error('Failed to load dataset rows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [selectedDatasetId, page, limit, labelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRows();
  };

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', datasetName || uploadFile.name.replace('.csv', ''));
      formData.append('textColumn', textCol);
      formData.append('labelColumn', labelCol);
      if (engCol.trim()) {
        formData.append('engagementColumn', engCol);
      }

      const res = await api.uploadDataset(formData);
      await loadDatasets();
      setSelectedDatasetId(res.dataset.id);
      setIsUploadOpen(false);
      setUploadFile(null);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const totalPages = Math.ceil(totalRows / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Data Explorer</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and validate ground-truth claims with verified social engagement
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dataset Selector */}
          <select
            value={selectedDatasetId}
            onChange={(e) => {
              setSelectedDatasetId(e.target.value);
              setPage(1);
            }}
            className="bg-navy-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.totalRows} records)
              </option>
            ))}
          </select>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-navy-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            Upload CSV
          </button>
        </div>
      </div>

      {/* Dataset Profile Card */}
      {selectedDataset && (
        <div className="glass-panel rounded-xl p-5 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">{selectedDataset.filename}</span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">{selectedDataset.name}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-navy-950 border border-slate-800 text-slate-300">
                Rows: <strong className="text-cyan-400">{selectedDataset.totalRows}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-navy-950 border border-slate-800 text-slate-300">
                Columns: <strong className="text-cyan-400">{selectedDataset.totalColumns}</strong>
              </span>
              <span
                className={`px-2.5 py-1 rounded border ${
                  selectedDataset.hasEngagement
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950/60 text-amber-300 border-amber-800'
                }`}
              >
                {selectedDataset.hasEngagement ? 'Engagement Verified' : 'Text-Only (No Engagement)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 text-xs">
            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Text Column</span>
              <span className="font-mono text-cyan-300 font-semibold">{selectedDataset.textColumn}</span>
            </div>
            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Ground Truth Label Column</span>
              <span className="font-mono text-cyan-300 font-semibold">{selectedDataset.labelColumn}</span>
            </div>
            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Engagement Diffusion Column</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {selectedDataset.engagementColumn || 'None (Disabled)'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Class Balance</span>
              <span className="font-mono text-slate-200">
                Real: {selectedDataset.classDistribution['0'] ?? selectedDataset.classDistribution['real'] ?? '624'} | 
                Fake: {selectedDataset.classDistribution['1'] ?? selectedDataset.classDistribution['fake'] ?? '432'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search headline keywords or claims..."
            className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-24 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-bold"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => {
              setLabelFilter('');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              labelFilter === ''
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Claims ({totalRows})
          </button>
          <button
            onClick={() => {
              setLabelFilter('0');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              labelFilter === '0'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Verified Factual (0)
          </button>
          <button
            onClick={() => {
              setLabelFilter('1');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              labelFilter === '1'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Misinformation (1)
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading benchmark records...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No matching records found. Try clearing filters or search terms.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/90 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-28">ID</th>
                  <th className="py-3 px-4">Headline / Claim Text</th>
                  <th className="py-3 px-4 w-32">Ground Truth</th>
                  {selectedDataset?.hasEngagement && (
                    <th className="py-3 px-4 w-28 text-right">Shares (Tweets)</th>
                  )}
                  <th className="py-3 px-4 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {rows.map((row, idx) => {
                  const textVal = row[selectedDataset?.textColumn || 'title'] || '';
                  const rawLabel = String(row[selectedDataset?.labelColumn || 'label'] || '');
                  const isFake = ['1', 'fake', 'rumor', 'pants-on-fire'].includes(rawLabel.toLowerCase());
                  const engVal = selectedDataset?.engagementColumn ? row[selectedDataset.engagementColumn] : null;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-navy-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedRow(row)}
                    >
                      <td className="py-3 px-4 font-mono text-slate-400 truncate max-w-[120px]">
                        {row.id || `#${idx + 1}`}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {textVal}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            isFake
                              ? 'bg-rose-950/70 text-rose-300 border-rose-800/70'
                              : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70'
                          }`}
                        >
                          {isFake ? 'Misinformation (1)' : 'Verified Real (0)'}
                        </span>
                      </td>
                      {selectedDataset?.hasEngagement && (
                        <td className="py-3 px-4 text-right font-mono text-cyan-300 font-semibold">
                          {engVal !== undefined && engVal !== null ? Number(engVal).toLocaleString() : '0'}
                        </td>
                      )}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRow(row);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800/80 bg-navy-950/60 text-xs text-slate-400">
          <div>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalRows)} of {totalRows} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded bg-navy-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded bg-navy-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Inspect Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Record Details</h3>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Headline / Text Content:
              </span>
              <p className="text-sm font-medium text-slate-100 p-3 rounded-lg bg-navy-950 border border-slate-800">
                {selectedRow[selectedDataset?.textColumn || 'title']}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Ground Truth Veracity</span>
                <span className="font-bold text-sm text-cyan-400">
                  {selectedRow[selectedDataset?.labelColumn || 'label'] === 1 || selectedRow[selectedDataset?.labelColumn || 'label'] === '1'
                    ? 'Misinformation (1)'
                    : 'Verified Factual (0)'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Twitter / X Sharing Count</span>
                <span className="font-bold text-sm text-slate-200 font-mono">
                  {selectedDataset?.engagementColumn ? selectedRow[selectedDataset.engagementColumn] : 'N/A'}
                </span>
              </div>
            </div>

            {selectedRow.news_url && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Source Publication URL:
                </span>
                <a
                  href={selectedRow.news_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1.5 truncate"
                >
                  {selectedRow.news_url}
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Upload Custom Research CSV</h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select CSV File:</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  required
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Dataset Display Name:</label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="e.g. GossipCop Celebrity Benchmark"
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Text Column:</label>
                  <input
                    type="text"
                    value={textCol}
                    onChange={(e) => setTextCol(e.target.value)}
                    required
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Label Column:</label>
                  <input
                    type="text"
                    value={labelCol}
                    onChange={(e) => setLabelCol(e.target.value)}
                    required
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Engagement (Opt):</label>
                  <input
                    type="text"
                    value={engCol}
                    onChange={(e) => setEngCol(e.target.value)}
                    placeholder="tweet_count"
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100"
                  />
                </div>
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {uploadError}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold disabled:opacity-50"
                >
                  {uploading ? 'Validating & Profiling...' : 'Upload & Validate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
