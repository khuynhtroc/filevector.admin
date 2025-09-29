import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ id: null, name: '', description: '', price: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        
        if (error) {
            setError('Không thể tải danh sách sản phẩm. Hãy kiểm tra lại quyền truy cập (RLS).');
            console.error(error);
        } else {
            setProducts(data);
        }
        setLoading(false);
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, description, price } = form;

        let result;
        if (isEditing) {
            result = await supabase.from('products').update({ name, description, price }).eq('id', form.id);
        } else {
            result = await supabase.from('products').insert([{ name, description, price }]);
        }

        if (result.error) {
            setError('Lỗi: ' + result.error.message);
        } else {
            resetForm();
            fetchProducts();
        }
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setForm(product);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) setError('Lỗi: ' + error.message);
            else fetchProducts();
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setForm({ id: null, name: '', description: '', price: 0 });
        setError('');
    };

    if (loading) return <p>Đang tải sản phẩm...</p>;

    return (
        <div>
            <h1>Quản lý Sản phẩm</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>{isEditing ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}</h3>
                <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} required />
                <input name="price" placeholder="Giá" type="number" value={form.price} onChange={handleChange} required />
                <textarea name="description" placeholder="Mô tả" value={form.description} onChange={handleChange} />
                <button type="submit">{isEditing ? 'Cập nhật' : 'Thêm mới'}</button>
                {isEditing && <button type="button" onClick={resetForm}>Hủy</button>}
            </form>

            <h3>Danh sách sản phẩm</h3>
            {products.length > 0 ? (
                <table>
                    <thead><tr><th>Tên</th><th>Giá</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.price}</td>
                                <td>
                                    <button onClick={() => handleEdit(p)}>Sửa</button>
                                    <button onClick={() => handleDelete(p.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Chưa có sản phẩm nào.</p>
            )}
        </div>
    );
}
