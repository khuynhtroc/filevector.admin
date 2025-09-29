import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    // Khởi tạo state với tất cả các trường để tránh lỗi
    const initialFormState = { id: null, name: '', description: '', price: 0, sku: '', image: '', download_url: '', date: '' };
    const [form, setForm] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        // Sắp xếp theo `date` hoặc `created_at` nếu bạn chưa có cột date
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        
        if (error) {
            setError('Không thể tải danh sách sản phẩm. Lỗi: ' + error.message);
            console.error(error);
        } else {
            setProducts(data || []); // Đảm bảo products luôn là một mảng
        }
        setLoading(false);
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const resetForm = () => {
        setIsEditing(false);
        setForm(initialFormState);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let { id, ...formData } = form;

        formData.price = parseFloat(formData.price) || 0;
        // Đảm bảo các trường không được rỗng được xử lý
        if (!formData.name || !formData.date) {
            setError("Tên sản phẩm và Ngày không được để trống.");
            return;
        }

        let result;
        if (isEditing) {
            result = await supabase.from('products').update(formData).eq('id', form.id);
        } else {
            result = await supabase.from('products').insert([formData]).select();
        }

        if (result.error) {
            setError('Lỗi khi lưu dữ liệu: ' + result.error.message);
        } else {
            resetForm();
            await fetchProducts();
        }
    };

    // PHIÊN BẢN AN TOÀN CỦA handleEdit
    const handleEdit = (product) => {
        setIsEditing(true);
        setForm({
            id: product.id,
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0,
            sku: product.sku || '',
            image: product.image || '',
            download_url: product.download_url || '',
            // KIỂM TRA product.date TRƯỚC KHI SỬ DỤNG
            date: product.date ? new Date(product.date).toISOString().slice(0, 10) : ''
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) setError('Lỗi khi xóa: ' + error.message);
            else await fetchProducts();
        }
    };

    // Các style để làm đẹp giao diện
    const tableCellStyle = { padding: '10px', border: '1px solid #dee2e6', verticalAlign: 'middle', textAlign: 'left' };
    const inputStyle = { margin: '5px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' };
    const buttonStyle = { padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' };

    if (loading) return <p>Đang tải sản phẩm...</p>;

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif' }}>
            <h1>Quản lý Sản phẩm</h1>
            {error && <p style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '4px' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '20px', background: '#fdfdff', borderRadius: '8px' }}>
                <h3>{isEditing ? `Chỉnh sửa: ${form.name}` : 'Thêm Sản phẩm Mới'}</h3>
                {/* Form inputs */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px'}}>
                    <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} required style={inputStyle} />
                    <input name="price" placeholder="Giá" type="number" value={form.price} onChange={handleChange} style={inputStyle} />
                    <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} style={inputStyle} />
                    <input name="date" type="date" value={form.date} onChange={handleChange} required style={inputStyle} />
                    <input name="image" placeholder="URL ảnh đại diện" value={form.image} onChange={handleChange} style={{...inputStyle, gridColumn: 'span 2'}} />
                    <input name="download_url" placeholder="URL tải về" value={form.download_url} onChange={handleChange} style={{...inputStyle, gridColumn: 'span 2'}} />
                </div>
                <textarea name="description" placeholder="Mô tả ngắn" value={form.description} onChange={handleChange} style={{...inputStyle, width: 'calc(100% - 20px)', height: '60px', marginTop: '10px'}} />
                <br/>
                <button type="submit" style={{ ...buttonStyle, background: '#28a745', color: 'white' }}>{isEditing ? 'Cập nhật' : 'Thêm mới'}</button>
                {isEditing && <button type="button" onClick={resetForm} style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}>Hủy</button>}
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                        <th style={tableCellStyle}>Ảnh</th>
                        <th style={{...tableCellStyle, width: '25%'}}>Tên / SKU</th>
                        <th style={{...tableCellStyle, width: '30%'}}>Mô tả</th>
                        <th style={tableCellStyle}>Giá</th>
                        <th style={tableCellStyle}>Ngày</th>
                        <th style={tableCellStyle}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id} style={{borderTop: '1px solid #dee2e6'}}>
                            <td style={tableCellStyle}>{p.image ? <img src={p.image} alt={p.name} style={{ height: '50px', width: '50px', objectFit: 'cover', borderRadius: '4px' }} /> : 'N/A'}</td>
                            <td style={tableCellStyle}><strong>{p.name}</strong><br/><small style={{color: '#6c757d'}}>SKU: {p.sku || 'N/A'}</small></td>
                            <td style={{ ...tableCellStyle, fontSize: '13px', color: '#495057' }}>{p.description}</td>
                            <td style={{ ...tableCellStyle, fontWeight: 'bold' }}>{p.price?.toLocaleString()} đ</td>
                            <td style={tableCellStyle}>{p.date ? new Date(p.date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                            <td style={tableCellStyle}>
                                <button onClick={() => handleEdit(p)} style={{...buttonStyle, background: '#007bff', color: 'white'}}>Sửa</button>
                                <button onClick={() => handleDelete(p.id)} style={{...buttonStyle, background: '#dc3545', color: 'white'}}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
