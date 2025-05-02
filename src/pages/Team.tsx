// src/pages/Team.tsx

import { useMemo, useState, Fragment } from "react"; // Import Fragment
import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/AxiosInstance";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
// Import komponen Dialog dari Headless UI
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild
} from "@headlessui/react";

// --- Tipe Data & Fungsi API (Tetap sama) ---
type Team = {
  id: number;
  name: string;
  member_count: number;
  leader_email: string;
};
type TeamInput = { name: string; member_count: number; leader_email: string };
const fetchTeams = async (): Promise<Team[]> => {
  /* ... */
  const { data } = await axios.get<Team[]>("/api/teams");
  return data;
};
const createTeam = async (newTeam: TeamInput): Promise<Team> => {
  /* ... */
  const { data } = await axios.post<Team>("/api/teams", newTeam);
  return data;
};
const updateTeam = async ({
  id,
  ...updatedData
}: TeamInput & { id: number }): Promise<Team> => {
  /* ... */
  const { data } = await axios.patch<Team>(`/api/teams/${id}`, updatedData);
  return data;
};
const deleteTeam = async (id: number): Promise<void> => {
  /* ... */
  await axios.delete(`/api/teams/${id}`);
};

// --- Komponen Utama ---
export const TeamPage = () => {
  const queryClient = useQueryClient();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State untuk modal tambah

  // --- Forms (Setup tetap di sini, tapi JSX dipindah ke Modal) ---
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd }
  } = useForm<TeamInput>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: errorsEdit }
  } = useForm<TeamInput>();

  // --- Queries & Mutations (Tetap sama) ---
  const {
    data: teams,
    isLoading,
    isError,
    error
  } = useQuery<Team[], Error>({ queryKey: ["teams"], queryFn: fetchTeams });
  const createMutation = useMutation<Team, Error, TeamInput>({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      alert("Team berhasil ditambahkan!");
      closeAddModal();
    },
    onError: (e) => alert(`Gagal: ${e.message}`)
  });
  const updateMutation = useMutation<Team, Error, TeamInput & { id: number }>({
    mutationFn: updateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      alert("Team berhasil diperbarui!");
      closeEditModal();
    },
    onError: (e) => alert(`Gagal: ${e.message}`)
  });
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: deleteTeam,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      alert("Team berhasil dihapus!");
      if (editingTeam?.id === id) closeEditModal();
    },
    onError: (e) => alert(`Gagal: ${e.message}`)
  });

  // --- Handlers ---
  const handleAddSubmit: SubmitHandler<TeamInput> = (data) => {
    const p = { ...data, member_count: Number(data.member_count) || 0 };
    createMutation.mutate(p);
  };
  const handleEditSubmit: SubmitHandler<TeamInput> = (data) => {
    if (!editingTeam) return;
    const p = { ...data, member_count: Number(data.member_count) || 0 };
    updateMutation.mutate({ id: editingTeam.id, ...p });
  };
  const handleEditClick = (team: Team) => {
    setEditingTeam(team);
    setEditValue("name", team.name);
    setEditValue("member_count", team.member_count);
    setEditValue("leader_email", team.leader_email);
  }; // Otomatis buka modal edit krn editingTeam tidak null
  const handleDeleteClick = (id: number) => {
    if (window.confirm(`Yakin hapus tim ID ${id}?`)) deleteMutation.mutate(id);
  };

  // Fungsi untuk buka/tutup modal
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetAdd();
  };
  const closeEditModal = () => {
    setEditingTeam(null);
    resetEdit();
  };

  // --- Kolom Tabel (Definisi tetap sama, Cell dirender di bawah) ---
  const columns = useMemo(
    () => [
      /* ... */ { Header: "ID", accessor: "id" },
      { Header: "Nama Tim", accessor: "name" },
      { Header: "Anggota", accessor: "member_count" },
      { Header: "Email Ketua", accessor: "leader_email" },
      { Header: "Aksi", id: "actions" }
    ],
    []
  );

  // === STYLING INPUT & TOMBOL (Tetap sama) ===
  const inputStyle =
    "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100";
  const buttonSolidStyle = (color: string) =>
    `inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-${color}-600 hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`;
  const buttonOutlineStyle = `inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`;
  const iconStyle = "h-5 w-5";
  const iconMargin = "mr-2";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Manajemen Tim</h1>
        {/* Tombol untuk membuka Modal Tambah Tim */}
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed mt-3 sm:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          <span>Tambah Tim Baru</span>
        </button>
      </div>

      {/* === DAFTAR TIM (Tabel) === */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-t border-gray-200">
          {isLoading && (
            <div className="text-center py-10 text-gray-500">
              Memuat data tim...
            </div>
          )}
          {isError && (
            <div className="text-center py-10 text-red-600">
              Error: {error.message}
            </div>
          )}
          {!isLoading && !isError && teams && teams.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.id || column.accessor}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.Header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team) => (
                    <tr
                      key={team.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {team.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {team.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {team.member_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.leader_email}
                      </td>
                      {/* Kolom Aksi */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditClick(team)}
                          disabled={
                            updateMutation.isPending || deleteMutation.isPending
                          }
                          className={`p-1 text-indigo-600 hover:text-indigo-800 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150`}
                          title="Edit Tim"
                        >
                          <PencilSquareIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(team.id)}
                          disabled={deleteMutation.isPending}
                          className={`p-1 text-red-600 hover:text-red-800 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150`}
                          title="Hapus Tim"
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables === team.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && !isError && (!teams || teams.length === 0) && (
            <div className="text-center py-10 text-gray-500">
              Belum ada data tim.
            </div>
          )}
        </div>
      </div>

      {/* === MODAL TAMBAH TIM === */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeAddModal}>
          {/* Backdrop */}
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

          {/* Konten Modal */}
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
                  Tambah Tim Baru{" "}
                </DialogTitle>
                <form
                  onSubmit={handleSubmitAdd(handleAddSubmit)}
                  className="mt-4 space-y-4"
                >
                  {/* Input fields untuk Add */}
                  <div>
                    <label
                      htmlFor="add_modal_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nama Tim
                    </label>
                    <input
                      id="add_modal_name"
                      type="text"
                      required
                      className={inputStyle}
                      {...registerAdd("name", {
                        required: "Nama tim wajib diisi"
                      })}
                    />
                    {errorsAdd.name && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsAdd.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="add_modal_member_count"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Jumlah Anggota
                    </label>
                    <input
                      id="add_modal_member_count"
                      type="number"
                      required
                      min="1"
                      className={inputStyle}
                      {...registerAdd("member_count", {
                        required: "Jumlah anggota wajib diisi",
                        valueAsNumber: true,
                        min: { value: 1, message: "Minimal 1 anggota" }
                      })}
                    />
                    {errorsAdd.member_count && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsAdd.member_count.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="add_modal_leader_email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Ketua Tim
                    </label>
                    <input
                      id="add_modal_leader_email"
                      type="email"
                      required
                      className={inputStyle}
                      {...registerAdd("leader_email", {
                        required: "Email ketua wajib diisi",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Format email tidak valid"
                        }
                      })}
                    />
                    {errorsAdd.leader_email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsAdd.leader_email.message}
                      </p>
                    )}
                  </div>
                  {/* Tombol Aksi Modal Add */}
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
                      {createMutation.isPending ? "Menyimpan..." : "Tambah"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* === MODAL EDIT TIM === */}
      <Transition appear show={!!editingTeam} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeEditModal}>
          {/* Backdrop */}
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
          {/* Konten Modal */}
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
                  Edit Tim: {editingTeam?.name}{" "}
                </DialogTitle>
                <form
                  onSubmit={handleSubmitEdit(handleEditSubmit)}
                  className="mt-4 space-y-4"
                >
                  {/* Input fields untuk Edit */}
                  <div>
                    <label
                      htmlFor="edit_modal_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nama Tim
                    </label>
                    <input
                      id="edit_modal_name"
                      type="text"
                      required
                      className={inputStyle}
                      {...registerEdit("name", {
                        required: "Nama tim wajib diisi"
                      })}
                    />
                    {errorsEdit.name && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsEdit.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="edit_modal_member_count"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Jumlah Anggota
                    </label>
                    <input
                      id="edit_modal_member_count"
                      type="number"
                      required
                      min="1"
                      className={inputStyle}
                      {...registerEdit("member_count", {
                        required: "Jumlah anggota wajib diisi",
                        valueAsNumber: true,
                        min: { value: 1, message: "Minimal 1 anggota" }
                      })}
                    />
                    {errorsEdit.member_count && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsEdit.member_count.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="edit_modal_leader_email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Ketua Tim
                    </label>
                    <input
                      id="edit_modal_leader_email"
                      type="email"
                      required
                      className={inputStyle}
                      {...registerEdit("leader_email", {
                        required: "Email ketua wajib diisi",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Format email tidak valid"
                        }
                      })}
                    />
                    {errorsEdit.leader_email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsEdit.leader_email.message}
                      </p>
                    )}
                  </div>
                  {/* Tombol Aksi Modal Edit */}
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
                      {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div> // Penutup container utama
  );
};

export default TeamPage;
