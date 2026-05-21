import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  X, 
  Check, 
  AlertCircle,
  Loader2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { candidateService } from '../services/api';

const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const candidateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  aadhaarNumber: z.string().regex(aadhaarRegex, 'Aadhaar must be exactly 12 numeric digits'),
  panNumber: z.string().regex(panRegex, 'PAN must be in standard format (e.g. ABCDE1234F)'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date of birth',
  }),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

const CandidateList: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(candidateSchema),
  });

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await candidateService.list({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setCandidates(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch candidates: ', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleCreateOrUpdate = async (data: any) => {
    setModalLoading(true);
    setErrorMessage(null);
    try {
      if (editingCandidate) {
        await candidateService.update(editingCandidate.id, data);
        setNotification({ message: 'Candidate profile updated successfully.', type: 'success' });
      } else {
        await candidateService.create(data);
        setNotification({ message: 'New candidate profile registered successfully.', type: 'success' });
      }
      setTimeout(() => setNotification(null), 5000);
      setIsModalOpen(false);
      reset();
      setEditingCandidate(null);
      fetchCandidates();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await candidateService.delete(id);
      setDeleteCandidateId(null);
      setNotification({ message: 'Candidate profile and all associated logs successfully deleted.', type: 'success' });
      setTimeout(() => setNotification(null), 5000);
      fetchCandidates();
    } catch (err) {
      setDeleteCandidateId(null);
      setNotification({ message: 'Failed to delete candidate profile.', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const openAddModal = () => {
    reset();
    setEditingCandidate(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cand: any) => {
    setErrorMessage(null);
    setEditingCandidate(cand);
    setValue('fullName', cand.fullName);
    setValue('email', cand.email);
    setValue('phone', cand.phone);
    setValue('aadhaarNumber', cand.aadhaarNumber);
    setValue('panNumber', cand.panNumber);
    setValue('dob', cand.dob.split('T')[0]);
    setValue('address', cand.address);
    setIsModalOpen(true);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = candidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(candidates.length / itemsPerPage);

  return (
    <div className="flex-1 p-8 flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Title Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Candidates Directory</h2>
          <p className="text-slate-400 text-sm mt-1">Submit, edit, and initiate verification audits for recruiter databases.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Candidate
        </button>
      </div>

      {/* Modern Glass Alert Toast */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <p className="text-xs font-semibold">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      {/* Query Filters Grid */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              className="w-full glass-input pl-10 text-xs py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'All', value: '' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Verified', value: 'VERIFIED' },
              { label: 'Partial', value: 'PARTIAL' },
              { label: 'Failed', value: 'FAILED' },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  statusFilter === btn.value
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-slate-400 font-semibold tracking-wider">Syncing directories...</span>
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center">
              <Search className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="font-extrabold text-slate-300">No candidates found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Could not find any candidates matching active status filters. Click Add Candidate to create a new profile.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-950/20 border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Contact Info</th>
                    <th className="py-4 px-6">Identification Numbers</th>
                    <th className="py-4 px-6">Audit Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {currentCandidates.map((cand) => (
                    <tr key={cand.id} className="group hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-xs text-indigo-300">
                            {cand.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-slate-200 group-hover:text-indigo-400 transition-colors">{cand.fullName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Created: {new Date(cand.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col text-xs leading-normal">
                          <span className="text-slate-300 font-semibold">{cand.email}</span>
                          <span className="text-slate-500 font-medium">{cand.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5 text-xs font-mono">
                          <span className="text-slate-400 text-[11px]">Aadhaar: XXXX-XXXX-{cand.aadhaarNumber.slice(-4)}</span>
                          <span className="text-slate-400 text-[11px]">PAN: XXXXX{cand.panNumber.slice(-4)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase border ${
                          cand.status === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          cand.status === 'PENDING' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                          cand.status === 'PARTIAL' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {cand.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => navigate(`/candidates/${cand.id}`)}
                            title="View candidate dashboard"
                            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all duration-150"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(cand)}
                            title="Edit profile"
                            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-indigo-400 transition-all duration-150"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidateId(cand.id)}
                            title="Remove profile"
                            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 text-slate-500 hover:text-red-400 transition-all duration-150"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/40">
                <span className="text-xs text-slate-500 font-semibold">
                  Page {currentPage} of {totalPages} ({candidates.length} total entries)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CRUD Add/Edit Floating Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="text-xl font-extrabold text-white font-sans mb-1">
              {editingCandidate ? 'Edit Candidate Details' : 'Add Candidate Profile'}
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              {editingCandidate 
                ? 'Update candidate demographic and document details'
                : 'Create background audit pipeline profiles'}
            </p>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-normal">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Candidate Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="glass-input text-xs"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <span className="text-[10px] text-red-400 font-semibold">{errors.fullName.message as string}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="glass-input text-xs"
                    {...register('email')}
                  />
                  {errors.email && (
                    <span className="text-[10px] text-red-400 font-semibold">{errors.email.message as string}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="glass-input text-xs"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <span className="text-[10px] text-red-400 font-semibold">{errors.phone.message as string}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aadhaar Number (12 Digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="123456789012"
                    className="glass-input text-xs font-mono"
                    {...register('aadhaarNumber')}
                  />
                  {errors.aadhaarNumber && (
                    <span className="text-[10px] text-red-400 font-semibold">{errors.aadhaarNumber.message as string}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PAN Number (ABCDE1234F)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    className="glass-input text-xs font-mono uppercase"
                    {...register('panNumber')}
                  />
                  {errors.panNumber && (
                    <span className="text-[10px] text-red-400 font-semibold">{errors.panNumber.message as string}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                <input
                  type="date"
                  className="glass-input text-xs"
                  {...register('dob')}
                />
                {errors.dob && (
                  <span className="text-[10px] text-red-400 font-semibold">{errors.dob.message as string}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Residential Address</label>
                <textarea
                  placeholder="Street name, landmark, city, pin code..."
                  rows={3}
                  className="glass-input text-xs resize-none"
                  {...register('address')}
                />
                {errors.address && (
                  <span className="text-[10px] text-red-400 font-semibold">{errors.address.message as string}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Check className="w-4.5 h-4.5" />
                    {editingCandidate ? 'Update Profile' : 'Register Profile'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Custom Deletion Confirmation Modal Dialog */}
      {deleteCandidateId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm glass-panel rounded-2xl p-6 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Delete Candidate?</h4>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Are you absolutely sure? This will delete all associated verification logs permanently. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteCandidateId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-all duration-200"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
