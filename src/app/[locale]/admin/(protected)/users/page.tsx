"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  _count?: { orders: number };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);

      const r = await fetch(`/api/admin/users?${params}`, { cache: "no-store" });
      const j = await r.json();
      setUsers(j.users || []);
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "customer"
    });
    setShowAddModal(true);
  };

  const createUser = async () => {
    if (!formData.email || !formData.password) {
      alert("Email ve şifre gerekli");
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Kullanıcı oluşturuldu!");
        setShowAddModal(false);
        loadUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Bir hata oluştu");
      }
    } catch (e) {
      console.error("Failed to create user:", e);
      alert("Bir hata oluştu");
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Kullanıcı güncellendi!");
        setShowEditModal(false);
        loadUsers();
      } else {
        alert("Bir hata oluştu");
      }
    } catch (e) {
      console.error("Failed to update user:", e);
      alert("Bir hata oluştu");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        alert("Kullanıcı silindi!");
        loadUsers();
      } else {
        alert("Bir hata oluştu");
      }
    } catch (e) {
      console.error("Failed to delete user:", e);
      alert("Bir hata oluştu");
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; variant: string }> = {
      superadmin: { label: "Süper Admin", variant: "destructive" },
      admin: { label: "Admin", variant: "default" },
      customer: { label: "Müşteri", variant: "secondary" }
    };
    return badges[role] || { label: role, variant: "outline" };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcılar & Roller</h1>
          <p className="text-sm text-muted-foreground">
            Sistem kullanıcılarını ve yetkilerini yönetin
          </p>
        </div>
        <Button onClick={openAddModal}>
          + Yeni Kullanıcı
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="İsim veya email ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border px-3 py-2 text-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Roller</option>
          <option value="superadmin">Süper Admin</option>
          <option value="admin">Admin</option>
          <option value="customer">Müşteri</option>
        </select>
      </div>

      <div className="rounded-lg border overflow-hidden bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-medium">Kullanıcı</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Sipariş Sayısı</th>
                  <th className="px-4 py-3 font-medium">Kayıt Tarihi</th>
                  <th className="px-4 py-3 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{user.name || "—"}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getRoleBadge(user.role).variant as any}>
                        {getRoleBadge(user.role).label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">{user._count?.orders || 0}</td>
                    <td className="px-4 py-3">
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(user)}>
                          Düzenle
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Kullanıcı bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showEditModal || showAddModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {showEditModal ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Oluştur"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">İsim</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="user@example.com"
                  disabled={showEditModal}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {showEditModal ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="customer">Müşteri</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Süper Admin</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  • Müşteri: Normal kullanıcı, alışveriş yapabilir<br />
                  • Admin: Admin paneline erişim<br />
                  • Süper Admin: Tüm yetkilere sahip
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => { 
                  setShowEditModal(false); 
                  setShowAddModal(false); 
                  setEditingUser(null); 
                }}
              >
                İptal
              </Button>
              <Button onClick={showEditModal ? updateUser : createUser}>
                {showEditModal ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


