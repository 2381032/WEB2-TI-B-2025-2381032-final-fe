// src/pages/Player.tsx

import { useMemo, useState, Fragment } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/AxiosInstance"; // Sesuaikan path
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

// --- Tipe Data Player ---
type Player = {
  id: number;
  name: string;
  rank?: string;
  skill?: string;
  email: string;
};
type PlayerInput = {
  name: string;
  rank?: string;
  skill?: string;
  email: string;
};

// --- Fungsi API Player ---
const fetchPlayers = async (): Promise<Player[]> => {
  const { data } = await axios.get<Player[]>("/api/players"); // Endpoint Player
  return data;
};
const createPlayer = async (newPlayer: PlayerInput): Promise<Player> => {
  const { data } = await axios.post<Player>("/api/players", newPlayer);
  return data;
};
const updatePlayer = async ({
  id,
  ...updatedData
}: PlayerInput & { id: number }): Promise<Player> => {
  const { data } = await axios.patch<Player>(`/api/players/${id}`, updatedData);
  return data;
};
const deletePlayer = async (id: number): Promise<void> => {
  await axios.delete(`/api/players/${id}`);
};

export const PlayerPage = () => {
  const queryClient = useQueryClient();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- Forms ---
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd }
  } = useForm<PlayerInput>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: errorsEdit }
  } = useForm<PlayerInput>({
    defaultValues: { name: "", rank: "", skill: "", email: "" } // Default untuk form edit
  });

  // --- Queries & Mutations ---
  const {
    data: players,
    isLoading,
    isError,
    error
  } = useQuery<Player[], Error>({
    queryKey: ["players"],
    queryFn: fetchPlayers
  });
  const createMutation = useMutation<Player, Error, PlayerInput>({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      alert("Player berhasil ditambahkan!");
      closeAddModal();
    },
    onError: (e) => alert(`Gagal: ${e.message}`)
  });
  const updateMutation = useMutation<
    Player,
    Error,
    PlayerInput & { id: number }
  >({
    mutationFn: updatePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      alert("Player berhasil diperbarui!");
      closeEditModal();
    },
    onError: (e) => alert(`Gagal: ${e.message}`)
  });
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: deletePlayer,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      alert("Player berhasil dihapus!");
      if (editingPlayer?.id === id) closeEditModal();
    },
    onError: (e) => alert(`Gagal: ${e.message}`)
  });

  // --- Handlers ---
  const handleAddSubmit: SubmitHandler<PlayerInput> = (data) =>
    createMutation.mutate(data);
  const handleEditSubmit: SubmitHandler<PlayerInput> = (data) => {
    if (!editingPlayer) return;
    updateMutation.mutate({ id: editingPlayer.id, ...data });
  };
  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
    setEditValue("name", player.name);
    setEditValue("rank", player.rank || "");
    setEditValue("skill", player.skill || "");
    setEditValue("email", player.email);
  };
  const handleDeleteClick = (id: number) => {
    if (window.confirm(`Yakin hapus player ID ${id}?`))
      deleteMutation.mutate(id);
  };
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetAdd();
  };
  const closeEditModal = () => {
    setEditingPlayer(null);
    resetEdit();
  };

  // --- Kolom Tabel ---
  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Nama Player", accessor: "name" },
      {
        Header: "Pangkat",
        accessor: "rank",
        Cell: ({ value }: { value?: string }) => value || "-"
      }, // Tampilkan '-' jika null/kosong
      {
        Header: "Keahlian",
        accessor: "skill",
        Cell: ({ value }: { value?: string }) => value || "-"
      }, // Tampilkan '-' jika null/kosong
      { Header: "Email", accessor: "email" },
      {
        Header: "Aksi",
        id: "actions",
        Cell: ({ row }: { row: { original: Player } }) => (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => handleEditClick(row.original)}
              disabled={updateMutation.isPending || deleteMutation.isPending}
              className={`p-1 text-indigo-600 hover:text-indigo-800 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150`}
              title="Edit Player"
            >
              <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => handleDeleteClick(row.original.id)}
              disabled={deleteMutation.isPending}
              className={`p-1 text-red-600 hover:text-red-800 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150`}
              title="Hapus Player"
            >
              {deleteMutation.isPending &&
              deleteMutation.variables === row.original.id ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <TrashIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        )
      }
    ],
    [
      updateMutation.isPending,
      deleteMutation.isPending,
      deleteMutation.variables
    ]
  ); // Dependensi untuk disable tombol

  // === STYLING ===
  const inputStyle =
    "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100";
  const buttonSolidStyle = (color: string) =>
    `inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-${color}-600 hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`;
  const buttonOutlineStyle = `inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`;
  const iconStyle = "h-5 w-5";
  const iconMargin = "mr-2";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Halaman */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Manajemen Player
        </h1>
        <button
          type="button"
          onClick={openAddModal}
          className={`${buttonSolidStyle("indigo")} mt-3 sm:mt-0`}
        >
          <PlusIcon
            className={`${iconStyle} ${iconMargin}`}
            aria-hidden="true"
          />
          <span>Tambah Player Baru</span>
        </button>
      </div>

      {/* Daftar Player (Tabel) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-t border-gray-200">
          {isLoading && (
            <div className="text-center py-10 text-gray-500">
              Memuat data player...
            </div>
          )}
          {isError && (
            <div className="text-center py-10 text-red-600">
              Error: {error.message}
            </div>
          )}
          {!isLoading && !isError && players && players.length > 0 && (
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
                  {players.map((player) => (
                    <tr
                      key={player.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {player.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {player.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.rank || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.skill || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.email}
                      </td>
                      {/* Render Aksi */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {columns
                          .find((c) => c.id === "actions")
                          ?.Cell?.({ row: { original: player } })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && !isError && (!players || players.length === 0) && (
            <div className="text-center py-10 text-gray-500">
              Belum ada data player.
            </div>
          )}
        </div>
      </div>

      {/* === MODAL TAMBAH PLAYER === */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeAddModal}>
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
                  Tambah Player Baru{" "}
                </DialogTitle>
                <form
                  onSubmit={handleSubmitAdd(handleAddSubmit)}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="add_player_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nama Player
                    </label>
                    <input
                      id="add_player_name"
                      type="text"
                      required
                      className={inputStyle}
                      {...registerAdd("name", {
                        required: "Nama player wajib diisi"
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
                      htmlFor="add_rank"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pangkat (Opsional)
                    </label>
                    <input
                      id="add_rank"
                      type="text"
                      className={inputStyle}
                      {...registerAdd("rank")}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="add_skill"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Keahlian (Opsional)
                    </label>
                    <input
                      id="add_skill"
                      type="text"
                      className={inputStyle}
                      {...registerAdd("skill")}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="add_player_email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Player
                    </label>
                    <input
                      id="add_player_email"
                      type="email"
                      required
                      className={inputStyle}
                      {...registerAdd("email", {
                        required: "Email wajib diisi",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Format email tidak valid"
                        }
                      })}
                    />
                    {errorsAdd.email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsAdd.email.message}
                      </p>
                    )}
                  </div>
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

      {/* === MODAL EDIT PLAYER === */}
      <Transition appear show={!!editingPlayer} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeEditModal}>
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
                  Edit Player: {editingPlayer?.name}{" "}
                </DialogTitle>
                <form
                  onSubmit={handleSubmitEdit(handleEditSubmit)}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="edit_player_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nama Player
                    </label>
                    <input
                      id="edit_player_name"
                      type="text"
                      required
                      className={inputStyle}
                      {...registerEdit("name", {
                        required: "Nama player wajib diisi"
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
                      htmlFor="edit_rank"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pangkat (Opsional)
                    </label>
                    <input
                      id="edit_rank"
                      type="text"
                      className={inputStyle}
                      {...registerEdit("rank")}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit_skill"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Keahlian (Opsional)
                    </label>
                    <input
                      id="edit_skill"
                      type="text"
                      className={inputStyle}
                      {...registerEdit("skill")}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit_player_email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Player
                    </label>
                    <input
                      id="edit_player_email"
                      type="email"
                      required
                      className={inputStyle}
                      {...registerEdit("email", {
                        required: "Email wajib diisi",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Format email tidak valid"
                        }
                      })}
                    />
                    {errorsEdit.email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errorsEdit.email.message}
                      </p>
                    )}
                  </div>
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
    </div>
  );
};

export default PlayerPage;
