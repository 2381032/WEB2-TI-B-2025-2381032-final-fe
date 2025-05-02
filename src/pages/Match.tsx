// src/pages/Match.tsx

import { useMemo, useState, Fragment } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/AxiosInstance";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild
} from "@headlessui/react";

// --- Tipe Data & Helper Tanggal (Tetap sama) ---
type Match = {
  id: number;
  schedule_date: string;
  total_teams: number;
  admin_email: string;
};
type MatchInput = {
  schedule_date: string;
  total_teams: number;
  admin_email: string;
};
const formatDateTimeForInput = (isoString?: string | Date): string => {
  /* ... (sama) */
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting date for input:", isoString, e);
    return "";
  }
};
const formatDateTimeForDisplay = (dateString?: string | Date): string => {
  /* ... (sama) */
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: false
    });
  } catch (e) {
    console.error("Error formatting date for display:", dateString, e);
    return String(dateString);
  }
};

// --- Fungsi API Match (Tetap sama) ---
const fetchMatches = async (): Promise<Match[]> => {
  /* ... */
  const { data } = await axios.get<Match[]>("/api/matches");
  return data;
};
const createMatch = async (newMatch: MatchInput): Promise<Match> => {
  /* ... */
  const { data } = await axios.post<Match>("/api/matches", newMatch);
  return data;
};
const updateMatch = async ({
  id,
  ...updatedData
}: MatchInput & { id: number }): Promise<Match> => {
  /* ... */
  const { data } = await axios.patch<Match>(`/api/matches/${id}`, updatedData);
  return data;
};
const deleteMatch = async (id: number): Promise<void> => {
  /* ... */
  await axios.delete(`/api/matches/${id}`);
};

export const MatchPage = () => {
  // ... state, forms, queries, mutations (Tetap sama) ...
  const queryClient = useQueryClient();
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd }
  } = useForm<MatchInput>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: errorsEdit }
  } = useForm<MatchInput>({
    defaultValues: { schedule_date: "", total_teams: 1, admin_email: "" }
  });
  const {
    data: matches,
    isLoading,
    isError,
    error
  } = useQuery<Match[], Error>({
    queryKey: ["matches"],
    queryFn: fetchMatches
  });
  const createMutation = useMutation<Match, Error, MatchInput>({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      alert("Match berhasil ditambahkan!");
      closeAddModal();
    },
    onError: (e) => alert(`Gagal: ${e.message}`)
  });
  const updateMutation = useMutation<Match, Error, MatchInput & { id: number }>(
    {
      mutationFn: updateMatch,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        alert("Match berhasil diperbarui!");
        closeEditModal();
      },
      onError: (e) => alert(`Gagal: ${e.message}`)
    }
  );
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: deleteMatch,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      alert("Match berhasil dihapus!");
      if (editingMatch?.id === id) closeEditModal();
    },
    onError: (e) => alert(`Gagal: ${e.message}`)
  });

  // --- Handlers (Tetap sama) ---
  const handleAddSubmit: SubmitHandler<MatchInput> = (data) => {
    const p = { ...data, total_teams: Number(data.total_teams) || 0 };
    createMutation.mutate(p);
  };
  const handleEditSubmit: SubmitHandler<MatchInput> = (data) => {
    if (!editingMatch) return;
    const p = { ...data, total_teams: Number(data.total_teams) || 0 };
    updateMutation.mutate({ id: editingMatch.id, ...p });
  };
  const handleEditClick = (match: Match) => {
    setEditingMatch(match);
    setEditValue("schedule_date", formatDateTimeForInput(match.schedule_date));
    setEditValue("total_teams", match.total_teams);
    setEditValue("admin_email", match.admin_email);
  };
  const handleDeleteClick = (id: number) => {
    if (window.confirm(`Yakin hapus match ID ${id}?`))
      deleteMutation.mutate(id);
  };
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetAdd();
  };
  const closeEditModal = () => {
    setEditingMatch(null);
    resetEdit();
  };

  // --- Kolom Tabel (Hanya definisi Header, tidak perlu Cell lagi) ---
  const columns = useMemo(
    () => [
      { Header: "ID", id: "id" }, // Beri id jika tidak ada accessor
      { Header: "Jadwal", id: "schedule_date" },
      { Header: "Total Tim", id: "total_teams" },
      { Header: "Admin Email", id: "admin_email" },
      { Header: "Aksi", id: "actions" }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    []
  ); // Dependensi tidak lagi relevan jika Cell tidak dipakai di sini

  // === STYLING (Tetap sama) ===
  const inputStyle =
    "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100";
  const buttonSolidStyle = (color: string) =>
    `inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-${color}-600 hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`;
  const buttonOutlineStyle = `inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ... Header Halaman (Tombol Tambah) ... */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Manajemen Match
        </h1>
        <button
          type="button"
          onClick={openAddModal}
          className={`${buttonSolidStyle("indigo")} mt-3 sm:mt-0`}
        >
          <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          <span>Tambah Match Baru</span>
        </button>
      </div>

      {/* Daftar Match (Tabel) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-t border-gray-200">
          {/* ... Loading/Error/Empty State ... */}
          {isLoading && (
            <div className="text-center py-10 text-gray-500">
              Memuat data match...
            </div>
          )}
          {isError && (
            <div className="text-center py-10 text-red-600">
              Error: {error.message}
            </div>
          )}
          {!isLoading && !isError && matches && matches.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Render header dari definisi columns */}
                    {columns.map((column) => (
                      <th
                        key={column.id}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.Header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.map((match) => (
                    <tr
                      key={match.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Render data cell secara langsung */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {match.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTimeForDisplay(match.schedule_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {match.total_teams}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {match.admin_email}
                      </td>
                      {/* Render kolom Aksi secara langsung */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(match)}
                            disabled={
                              updateMutation.isPending ||
                              deleteMutation.isPending
                            }
                            className={`p-1 text-indigo-600 hover:text-indigo-800 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150`}
                            title="Edit Match"
                          >
                            <PencilSquareIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(match.id)}
                            disabled={deleteMutation.isPending}
                            className={`p-1 text-red-600 hover:text-red-800 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150`}
                            title="Hapus Match"
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables === match.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <TrashIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* ... State jika tidak ada data ... */}
          {!isLoading && !isError && (!matches || matches.length === 0) && (
            <div className="text-center py-10 text-gray-500">
              Belum ada data match.
            </div>
          )}
        </div>
      </div>

      {/* ... Modals Add/Edit (Isinya Tetap sama) ... */}
      {/* === MODAL TAMBAH MATCH === */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeAddModal}>
          {/* ... Backdrop ... */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="max-w-md w-full rounded-xl bg-white p-6 shadow-xl">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {" "}
                  Tambah Match Baru{" "}
                </DialogTitle>
                <form
                  onSubmit={handleSubmitAdd(handleAddSubmit)}
                  className="mt-4 space-y-4"
                >
                  {/* ... Input Fields ... */}
                  <div>
                    <label
                      htmlFor="add_schedule_date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Jadwal Match
                    </label>
                    <input
                      id="add_schedule_date"
                      type="datetime-local"
                      required
                      className={inputStyle}
                      {...registerAdd("schedule_date", {
                        required: "Jadwal wajib diisi"
                      })}
                    />
                    {errorsAdd.schedule_date && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsAdd.schedule_date.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="add_total_teams"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Total Tim (Slot)
                    </label>
                    <input
                      id="add_total_teams"
                      type="number"
                      required
                      min="1"
                      className={inputStyle}
                      {...registerAdd("total_teams", {
                        required: "Total tim wajib diisi",
                        valueAsNumber: true,
                        min: { value: 1, message: "Minimal 1 tim" }
                      })}
                    />
                    {errorsAdd.total_teams && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsAdd.total_teams.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="add_admin_email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Admin Match
                    </label>
                    <input
                      id="add_admin_email"
                      type="email"
                      required
                      className={inputStyle}
                      {...registerAdd("admin_email", {
                        required: "Email admin wajib diisi",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Format email tidak valid"
                        }
                      })}
                    />
                    {errorsAdd.admin_email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsAdd.admin_email.message}
                      </p>
                    )}
                  </div>
                  {/* ... Tombol Modal ... */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeAddModal}
                      className={buttonOutlineStyle}
                    >
                      {" "}
                      Batal{" "}
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className={buttonSolidStyle("indigo")}
                    >
                      {" "}
                      {createMutation.isPending
                        ? "Menyimpan..."
                        : "Tambah"}{" "}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* === MODAL EDIT MATCH === */}
      <Transition appear show={!!editingMatch} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeEditModal}>
          {/* ... Backdrop ... */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="max-w-md w-full rounded-xl bg-white p-6 shadow-xl">
                {/* ... DialogTitle ... */}
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {" "}
                  Edit Match (ID: {editingMatch?.id}){" "}
                </DialogTitle>
                <form
                  onSubmit={handleSubmitEdit(handleEditSubmit)}
                  className="mt-4 space-y-4"
                >
                  {/* ... Input Fields ... */}
                  <div>
                    <label
                      htmlFor="edit_schedule_date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Jadwal Match
                    </label>
                    <input
                      id="edit_schedule_date"
                      type="datetime-local"
                      required
                      className={inputStyle}
                      {...registerEdit("schedule_date", {
                        required: "Jadwal wajib diisi"
                      })}
                    />
                    {errorsEdit.schedule_date && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsEdit.schedule_date.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="edit_total_teams"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Total Tim (Slot)
                    </label>
                    <input
                      id="edit_total_teams"
                      type="number"
                      required
                      min="1"
                      className={inputStyle}
                      {...registerEdit("total_teams", {
                        required: "Total tim wajib diisi",
                        valueAsNumber: true,
                        min: { value: 1, message: "Minimal 1 tim" }
                      })}
                    />
                    {errorsEdit.total_teams && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsEdit.total_teams.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="edit_admin_email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Admin Match
                    </label>
                    <input
                      id="edit_admin_email"
                      type="email"
                      required
                      className={inputStyle}
                      {...registerEdit("admin_email", {
                        required: "Email admin wajib diisi",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Format email tidak valid"
                        }
                      })}
                    />
                    {errorsEdit.admin_email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsEdit.admin_email.message}
                      </p>
                    )}
                  </div>
                  {/* ... Tombol Modal ... */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className={buttonOutlineStyle}
                    >
                      {" "}
                      Batal{" "}
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className={buttonSolidStyle("green")}
                    >
                      {" "}
                      {updateMutation.isPending
                        ? "Menyimpan..."
                        : "Simpan"}{" "}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div> // Penutup container
  );
};

export default MatchPage;
