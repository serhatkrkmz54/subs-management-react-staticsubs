'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StaticSubscription } from '@/types/subscription';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<StaticSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, isAuthenticated } = useAuth();
    const router = useRouter();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<StaticSubscription | null>(null);

    const [formData, setFormData] = useState<StaticSubscription>({
        sabonelikAdi: '',
        sodemeMiktari: 0,
        sodemeBirimi: 'TL',
        sfrequency: 'AYLIK',
        slogoUrl: '',
        skategori: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchSubscriptions();
    }, [isAuthenticated]);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('http://localhost:88/web/static-subscriptions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Abonelikler yüklenemedi');
            const data = await response.json();
            setSubscriptions(data);
        } catch (err) {
            setError('Abonelikler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            sabonelikAdi: '',
            sodemeMiktari: 0,
            sodemeBirimi: 'TL',
            sfrequency: 'AYLIK',
            slogoUrl: '',
            skategori: 'GENEL'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:88/web/static-subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Abonelik eklenemedi');
            await fetchSubscriptions();
            resetForm();
        } catch (err) {
            setError('Abonelik eklenirken bir hata oluştu');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:88/web/static-subscriptions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Abonelik silinemedi');
            await fetchSubscriptions();
        } catch (err) {
            setError('Abonelik silinirken bir hata oluştu');
        }
    };

    const handleEdit = (subscription: StaticSubscription) => {
        setEditingSubscription(subscription);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubscription?.id) return;

        try {
            const response = await fetch(`http://localhost:88/web/static-subscriptions/${editingSubscription.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingSubscription)
            });
            if (!response.ok) throw new Error('Abonelik güncellenemedi');
            await fetchSubscriptions();
            setIsEditModalOpen(false);
            setEditingSubscription(null);
        } catch (err) {
            setError('Abonelik güncellenirken bir hata oluştu');
        }
    };

    if (loading) return <div className="text-center p-4">Yükleniyor...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Statik Abonelikler</h1>
            
            {/* Abonelik Ekleme Formu */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-semibold mb-4">Yeni Abonelik Ekle</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Abonelik Adı"
                            className="p-2 border rounded"
                            value={formData.sabonelikAdi}
                            onChange={(e) => setFormData({...formData, sabonelikAdi: e.target.value})}
                            required
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Ödeme Miktarı"
                                className="p-2 border rounded flex-1"
                                value={formData.sodemeMiktari}
                                onChange={(e) => setFormData({...formData, sodemeMiktari: Number(e.target.value)})}
                                required
                            />
                            <select
                                className="p-2 border rounded w-24"
                                value={formData.sodemeBirimi}
                                onChange={(e) => setFormData({...formData, sodemeBirimi: e.target.value})}
                                required
                            >
                                <option value="TL">TL</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                        <select
                            className="p-2 border rounded"
                            value={formData.sfrequency}
                            onChange={(e) => setFormData({...formData, sfrequency: e.target.value})}
                            required
                        >
                            <option value="AYLIK">AYLIK</option>
                            <option value="YILLIK">YILLIK</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Logo URL"
                            className="p-2 border rounded"
                            value={formData.slogoUrl}
                            onChange={(e) => setFormData({...formData, slogoUrl: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="Kategori"
                            className="p-2 border rounded"
                            value={formData.skategori}
                            onChange={(e) => setFormData({...formData, skategori: e.target.value})}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Abonelik Ekle
                    </button>
                </form>
            </div>

            {/* Abonelik Listesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            {subscription.slogoUrl && (
                                <div className="w-12 h-12 relative">
                                    <Image
                                        src={subscription.slogoUrl}
                                        alt={subscription.sabonelikAdi}
                                        fill
                                        className="object-contain rounded"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-semibold">{subscription.sabonelikAdi}</h3>
                                <span className="text-sm text-gray-500">{subscription.skategori}</span>
                            </div>
                        </div>
                        <div className="text-lg font-bold mb-2">
                            {subscription.sodemeMiktari} {subscription.sodemeBirimi || 'TL'}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                / {(subscription.sfrequency || 'AYLIK').toLowerCase()}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(subscription)}
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
                            >
                                Düzenle
                            </button>
                            <button
                                onClick={() => subscription.id && handleDelete(subscription.id)}
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1"
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Düzenleme Modalı */}
            {isEditModalOpen && editingSubscription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Abonelik Düzenle</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Abonelik Adı"
                                    className="p-2 border rounded w-full"
                                    value={editingSubscription.sabonelikAdi}
                                    onChange={(e) => setEditingSubscription({
                                        ...editingSubscription,
                                        sabonelikAdi: e.target.value
                                    })}
                                    required
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Ödeme Miktarı"
                                        className="p-2 border rounded flex-1"
                                        value={editingSubscription.sodemeMiktari}
                                        onChange={(e) => setEditingSubscription({
                                            ...editingSubscription,
                                            sodemeMiktari: Number(e.target.value)
                                        })}
                                        required
                                    />
                                    <select
                                        className="p-2 border rounded w-24"
                                        value={editingSubscription.sodemeBirimi}
                                        onChange={(e) => setEditingSubscription({
                                            ...editingSubscription,
                                            sodemeBirimi: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="TL">TL</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                                <select
                                    className="p-2 border rounded w-full"
                                    value={editingSubscription.sfrequency}
                                    onChange={(e) => setEditingSubscription({
                                        ...editingSubscription,
                                        sfrequency: e.target.value
                                    })}
                                    required
                                >
                                    <option value="AYLIK">AYLIK</option>
                                    <option value="YILLIK">YILLIK</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Logo URL"
                                    className="p-2 border rounded w-full"
                                    value={editingSubscription.slogoUrl}
                                    onChange={(e) => setEditingSubscription({
                                        ...editingSubscription,
                                        slogoUrl: e.target.value
                                    })}
                                />
                                <input
                                    type="text"
                                    placeholder="Kategori"
                                    className="p-2 border rounded w-full"
                                    value={editingSubscription.skategori}
                                    onChange={(e) => setEditingSubscription({
                                        ...editingSubscription,
                                        skategori: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
                                >
                                    Kaydet
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingSubscription(null);
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex-1"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 