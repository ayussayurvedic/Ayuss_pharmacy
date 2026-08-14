'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { AdminSkeleton } from '@/components/admin/AdminPrimitives';
import { TaxSettingsTab } from './components/TaxSettingsTab';
import { CarouselBannersTab } from './components/CarouselBannersTab';
import { ProductMediaTab } from './components/ProductMediaTab';

export default function AdminSettingsClient() {
  const { toast } = useToast();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'tax' | 'carousel' | 'products'>('tax');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // TAB 1: TAX SETTINGS STATE
  // ==========================================
  const [taxSettings, setTaxSettings] = useState<any>({
    id: '',
    tax_mode: 'UNCONFIGURED',
    configuration_status: 'UNCONFIGURED',
    legal_business_name: '',
    trade_name: 'S.S. PHARMACY',
    gstin: '',
    registered_address_line1: '',
    registered_address_line2: '',
    city: '',
    state: '',
    state_code: '',
    postal_code: '',
    country: 'India',
    invoice_prefix: 'SSP',
    credit_note_prefix: 'CN',
    pricing_tax_mode: 'TAX_INCLUSIVE',
    default_hsn_code: '',
    default_gst_rate: 12.00,
    delivery_gst_rate: 18.00,
    invoice_terms: 'Goods once sold are subject to S.S. PHARMACY terms.',
    support_email: 'ayuss.ayurvedic@gmail.com',
    support_phone: ''
  });

  // ==========================================
  // TAB 2: CAROUSEL BANNERS STATE
  // ==========================================
  const [banners, setBanners] = useState<any[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);

  // ==========================================
  // TAB 3: PRODUCT MEDIA STATE
  // ==========================================
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSavingId, setProductSavingId] = useState<string | null>(null);

  // ==========================================
  // DATA FETCHING
  // ==========================================
  const fetchTaxSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('business_tax_settings')
        .select('*')
        .maybeSingle();

      if (!error && data) {
        setTaxSettings(data);
      }
    } catch (err: any) {
      console.error('Fetch tax settings error:', err);
      toast.error('Failed to load tax settings.');
    }
  };

  const fetchBanners = async () => {
    setBannersLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_assets')
        .select('*')
        .eq('section_name', 'hero_carousel')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (err: any) {
      console.error('Fetch banners error:', err);
      toast.error('Failed to load carousel banners.');
    } finally {
      setBannersLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image, transparent_image, gallery_images')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Fetch products error:', err);
      toast.error('Failed to load products list.');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    await fetchTaxSettings();
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'carousel') {
      fetchBanners();
    } else if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab]);

  // ==========================================
  // TAB 1 HANDLERS (TAX SETTINGS)
  // ==========================================
  const handleSaveTaxDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...taxSettings,
        configuration_status: taxSettings.configuration_status === 'VERIFIED' ? 'VERIFIED' : 'DRAFT',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('business_tax_settings')
        .upsert(payload);

      if (error) throw error;

      toast.success('System configuration saved as draft.');
      await fetchTaxSettings();
    } catch (err: any) {
      console.error('Save tax settings error:', err);
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyTax = async () => {
    if (!taxSettings.legal_business_name || !taxSettings.registered_address_line1 || !taxSettings.state || !taxSettings.state_code) {
      toast.error('Legal Business Name, Address, State, and State Code are mandatory for verification.');
      return;
    }

    if (taxSettings.tax_mode === 'GST_REGISTERED' && !taxSettings.gstin) {
      toast.error('GSTIN is mandatory when tax mode is set to GST Registered.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const payload = {
        ...taxSettings,
        configuration_status: 'VERIFIED',
        verified_at: new Date().toISOString(),
        verified_by: userData.user?.id || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('business_tax_settings')
        .upsert(payload);

      if (error) throw error;

      toast.success('Configuration verified. Production invoicing active.');
      await fetchTaxSettings();
    } catch (err: any) {
      console.error('Verify settings error:', err);
      toast.error(err.message || 'Verification update failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // TAB 2 HANDLERS (CAROUSEL BANNERS)
  // ==========================================
  const handleAddBanner = () => {
    const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order || 0)) + 1 : 1;
    const newBanner = {
      id: `banner-${Date.now()}`,
      section_name: 'hero_carousel',
      desktop_image_url: '',
      mobile_image_url: '',
      title: '',
      subtitle: '',
      description: '',
      link_url: '',
      display_order: nextOrder,
      is_active: true,
      is_new: true
    };
    setBanners(prev => [...prev, newBanner]);
  };

  const handleRemoveBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const handleBannerChange = (id: string, field: string, value: any) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banners.length - 1) return;

    const newBanners = [...banners];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newBanners[index];
    newBanners[index] = newBanners[swapIndex];
    newBanners[swapIndex] = temp;

    const reordered = newBanners.map((banner, idx) => ({
      ...banner,
      display_order: idx + 1
    }));

    setBanners(reordered);
  };

  const handleSaveBanners = async () => {
    setIsSubmitting(true);
    try {

      const { data: dbBanners } = await supabase
        .from('page_assets')
        .select('id')
        .eq('section_name', 'hero_carousel');

      const currentIds = banners.map(b => b.id);
      const deletedIds = (dbBanners || [])
        .map(db => db.id)
        .filter(id => !currentIds.includes(id));

      if (deletedIds.length > 0) {
        const { error: delError } = await supabase
          .from('page_assets')
          .delete()
          .in('id', deletedIds);
        if (delError) throw delError;
      }

      const payloads = banners.map(b => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { is_new, ...cleanPayload } = b;
        return cleanPayload;
      });

      const { error: upsertError } = await supabase
        .from('page_assets')
        .upsert(payloads);

      if (upsertError) throw upsertError;

      toast.success('Homepage Carousel Banners saved successfully.');
      await fetchBanners();
    } catch (err: any) {
      console.error('Save banners error:', err);
      toast.error(err.message || 'Failed to save banners.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // TAB 3 HANDLERS (PRODUCT MEDIA)
  // ==========================================
  const handleProductMediaChange = (id: string, field: string, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSaveProductMedia = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setProductSavingId(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          image: product.image,
          transparent_image: product.transparent_image,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;
      toast.success(`Media updated for ${product.name}`);
    } catch (err: any) {
      console.error('Save product media error:', err);
      toast.error(err.message || 'Failed to update product media.');
    } finally {
      setProductSavingId(null);
    }
  };

  if (loading) {
    return <AdminSkeleton type="card" />;
  }

  return (
    <div className="space-y-5 pb-12 text-slate-800 font-sans">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#C9D5D5]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider">System Settings & Configuration</span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#134547]">S.S. Pharmacy Configuration</h1>
          <p className="text-xs text-slate-600 margin-0">Manage business details, tax rates, homepage banner carousels, and product media assets</p>
        </div>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex border-b border-[#C9D5D5]/60 p-0.5 bg-slate-100/60 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('tax')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${activeTab === 'tax' ? 'bg-[#1A5C5E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Tax & Business
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('carousel')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${activeTab === 'carousel' ? 'bg-[#1A5C5E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Hero Carousel
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${activeTab === 'products' ? 'bg-[#1A5C5E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Product Media
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'tax' && (
        <TaxSettingsTab
          taxSettings={taxSettings}
          setTaxSettings={setTaxSettings}
          isSubmitting={isSubmitting}
          onSaveDraft={handleSaveTaxDraft}
          onVerify={handleVerifyTax}
        />
      )}

      {activeTab === 'carousel' && (
        <CarouselBannersTab
          banners={banners}
          bannersLoading={bannersLoading}
          isSubmitting={isSubmitting}
          onAddBanner={handleAddBanner}
          onRemoveBanner={handleRemoveBanner}
          onBannerChange={handleBannerChange}
          onMoveBanner={handleMoveBanner}
          onSaveBanners={handleSaveBanners}
        />
      )}

      {activeTab === 'products' && (
        <ProductMediaTab
          products={products}
          productsLoading={productsLoading}
          productSavingId={productSavingId}
          onProductMediaChange={handleProductMediaChange}
          onSaveProductMedia={handleSaveProductMedia}
        />
      )}
    </div>
  );
}
