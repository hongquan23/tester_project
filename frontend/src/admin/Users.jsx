import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser } from "../api";

const Users = ({ styles }) => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("✅ Users component mounted!");
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("🔄 Fetching users...");
      setLoading(true);
      const response = await getUsers();
      console.log("📦 API Response:", response);
      console.log("📦 Response data:", response.data);
      
      // Thử các cấu trúc khác nhau
      const userData = response.data.data || response.data.users || response.data;
      console.log("👥 User data:", userData);
      
      setUsers(userData);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      console.error('❌ Error details:', err.response);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
      console.log("✅ Fetch complete");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await deleteUser(userId);
        await fetchUsers();
        alert('Xóa người dùng thành công!');
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Không thể xóa người dùng!');
      }
    }
  };

  console.log("🎨 Rendering Users component, loading:", loading, "error:", error, "users:", users);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
        <p>{error}</p>
        <button onClick={fetchUsers} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ===== HEADER ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <button
          style={{
            ...styles.button,
            ...styles.buttonSecondary,
            padding: '8px 12px',  
            fontSize: '14px',      
             width: 'auto',        
             minWidth: 'auto',    
            flex: 'none'     
          }}
          onClick={() => navigate('/admin/dashboard')}
        >
          ← Quay lại
        </button>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}
        >
          Quản lý người dùng
        </h1>
      </div>

      {/* ===== TABLE ===== */}
      <div style={styles.usersTable}>
        {/* TABLE HEADER */}
        <div
          style={{
            ...styles.tableHeader,
            display: 'grid',
            gridTemplateColumns: '100px 2fr 3fr 150px',
            alignItems: 'center'
          }}
        >
          <div>ID</div>
          <div>Tên</div>
          <div>Email</div>
          <div style={{ textAlign: 'center' }}>Hành động</div>
        </div>

        {/* TABLE ROWS */}
        {users && users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              style={{
                ...styles.tableRow,
                display: 'grid',
                gridTemplateColumns: '100px 2fr 3fr 150px',
                alignItems: 'center'
              }}
            >
              <div>#{user.id}</div>

              <div style={{ fontWeight: 600 }}>
                {user.name || user.username || user.full_name || 'N/A'}
              </div>

              <div style={{ color: '#2563eb' }}>
                {user.email}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px'
                }}
              >
                <Trash2
                  size={22}
                  color="#dc2626"
                  style={{ cursor: 'pointer' }}
                  title="Xoá người dùng"
                  onClick={() => handleDeleteUser(user.id)}
                />
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Không có người dùng nào
          </div>
        )}
      </div>
    </>
  );
};

export default Users;