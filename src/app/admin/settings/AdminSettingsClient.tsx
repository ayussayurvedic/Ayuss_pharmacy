'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { 
  AdminCard, 
  AdminStatusBadge, 
  AdminInput, 
  AdminSelect, 
  AdminTextarea, 
  AdminSkeleton 
} from '@/components/admin/AdminPrimitives';
import { 
  Save, 
  AlertTriangle, 
  CheckSquare, 
  Settings, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { AdminImageUploader } from '@/components/admin/AdminImageUploader';

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
    support_email: 'support@sspharmacy.in',
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
      title: 'New Banner Title',
      subtitle: 'New Banner Subtitle',
      description: 'New Banner Description content...',
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
    
    // Swap items in state array
    const temp = newBanners[index];
    newBanners[index] = newBanners[swapIndex];
    newBanners[swapIndex] = temp;

    // Recalculate display orders
    const reordered = newBanners.map((banner, idx) => ({
      ...banner,
      display_order: idx + 1
    }));

    setBanners(reordered);
  };

  const handleSaveBanners = async () => {
    setIsSubmitting(true);
    try {
      // Validate all banners have desktop and mobile URLs
      for (const banner of banners) {
        if (!banner.desktop_image_url) {
          toast.error(`Please select or upload a desktop image for "${banner.title}"`);
          setIsSubmitting(false);
          return;
        }
        if (!banner.mobile_image_url) {
          toast.error(`Please select or upload a mobile image for "${banner.title}"`);
          setIsSubmitting(false);
          return;
        }
      }

      // 1. Delete removed banners from database first
      // Find IDs that are currently in database but not in local state
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

      // 2. Upsert the current banners list
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

      {/* ============================================================
          TAB 1: TAX SETTINGS
          ============================================================ */}
      {activeTab === 'tax' && (
        <form onSubmit={handleSaveTaxDraft} className="space-y-5">
          <AdminCard className="bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C9D5D5]/40 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-[#1A5C5E]" />
                <div>
                  <h3 className="font-bold text-sm text-[#134547] m-0">Business Tax Safety Gate</h3>
                  <p className="text-xs text-slate-500 m-0">Controls tax calculation rules and document generation for invoices & credit notes</p>
                </div>
              </div>
              <div>
                <AdminStatusBadge 
                  status={taxSettings.configuration_status === 'VERIFIED' ? 'active' : 'inactive'} 
                  customLabel={taxSettings.configuration_status === 'VERIFIED' ? 'VERIFIED & ACTIVE' : 'DRAFT / UNCONFIGURED'} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminSelect
                label="Invoicing Tax Mode *"
                value={taxSettings.tax_mode || 'UNCONFIGURED'}
                onChange={(value) => setTaxSettings({ ...taxSettings, tax_mode: value })}
                options={[
                  { value: 'UNCONFIGURED', label: 'Unconfigured (Disable Taxes)' },
                  { value: 'GST_REGISTERED', label: 'GST Registered (Indian Goods & Services Tax)' },
                  { value: 'COMPOSITION_SCHEME', label: 'GST Composition Scheme' }
                ]}
              />

              <AdminSelect
                label="Pricing Base Mode *"
                value={taxSettings.pricing_tax_mode || 'TAX_INCLUSIVE'}
                onChange={(value) => setTaxSettings({ ...taxSettings, pricing_tax_mode: value })}
                options={[
                  { value: 'TAX_INCLUSIVE', label: 'Tax Inclusive Pricing (Standard retail)' },
                  { value: 'TAX_EXCLUSIVE', label: 'Tax Exclusive Pricing' }
                ]}
              />
            </div>
          </AdminCard>

          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="border-b border-[#C9D5D5]/40 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">2. Legal Business registration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label="Legal Business Name *"
                type="text"
                placeholder="e.g. S.S. PHARMACY INC"
                value={taxSettings.legal_business_name || ''}
                onChange={(e) => setTaxSettings({ ...taxSettings, legal_business_name: e.target.value })}
              />

              <AdminInput
                label="GSTIN (Tax Registration Number) *"
                type="text"
                placeholder="e.g. 37AAAAA0000A1Z1"
                value={taxSettings.gstin || ''}
                onChange={(e) => setTaxSettings({ ...taxSettings, gstin: e.target.value })}
              />
            </div>
          </AdminCard>

          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="border-b border-[#C9D5D5]/40 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">3. Registered Address Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label="Address Line 1 *"
                type="text"
                value={taxSettings.registered_address_line1 || ''}
                onChange={(e) => setTaxSettings({ ...taxSettings, registered_address_line1: e.target.value })}
              />

              <AdminInput
                label="Address Line 2"
                type="text"
                value={taxSettings.registered_address_line2 || ''}
                onChange={(e) => setTaxSettings({ ...taxSettings, registered_address_line2: e.target.value })}
              />

              <AdminInput
                label="City *"
                type="text"
                value={taxSettings.city || ''}
                onChange={(e) => setTaxSettings({ ...taxSettings, city: e.target.value })}
              />

              <AdminSelect
                label="State / Union Territory *"
                value={taxSettings.state || ''}
                onChange={(value) => setTaxSettings({ ...taxSettings, state: value })}
                options={[
                  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
                  { value: 'Telangana', label: 'Telangana' },
                  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                  { value: 'Karnataka', label: 'Karnataka' },
                  { value: 'Maharashtra', label: 'Maharashtra' }
                ]}
              />

              <AdminInput
                label="State Numeric Code *"
                type="text"
                placeholder="e.g. 37 for Andhra Pradesh"
                value={taxSettings.state_code || ''}
                onChange={(e) => setTaxSettings({ ...taxSettings, state_code: e.target.value })}
              />

              <AdminInput
                label="Postal PIN Code *"
                type="text"
                value={taxSettings.postal_code || ''}
                onChange={(e) => setTaxSettings({ ...taxSettings, postal_code: e.target.value })}
              />
            </div>
          </AdminCard>

          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="border-b border-[#C9D5D5]/40 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">4. Documents prefix & invoice terms</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label="Invoice Number prefix"
                type="text"
                value={taxSettings.invoice_prefix || 'SSP'}
                onChange={(e) => setTaxSettings({ ...taxSettings, invoice_prefix: e.target.value })}
              />

              <AdminInput
                label="Credit Note prefix"
                type="text"
                value={taxSettings.credit_note_prefix || 'CN'}
                onChange={(e) => setTaxSettings({ ...taxSettings, credit_note_prefix: e.target.value })}
              />
            </div>

            <AdminTextarea
              label="Standard Invoice Terms & Declarations"
              value={taxSettings.invoice_terms || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, invoice_terms: e.target.value })}
              className="text-slate-800 focus:outline-none"
            />
          </AdminCard>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#C9D5D5]/40">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Save Settings Draft</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleVerifyTax}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <CheckSquare size={14} />
              <span>Verify & Authorize</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================
          TAB 2: CAROUSEL BANNERS
          ============================================================ */}
      {activeTab === 'carousel' && (
        <div className="space-y-6">
          <AdminCard className="bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C9D5D5]/40 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#C9943E]" />
                <div>
                  <h3 className="font-bold text-sm text-[#134547] m-0">Homepage Carousel Banners</h3>
                  <p className="text-xs text-slate-500 m-0">Configure title text, slide actions, and view-specific images for the main hero slider</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddBanner}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Banner Slide</span>
              </button>
            </div>

            {bannersLoading ? (
              <AdminSkeleton type="table" />
            ) : banners.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-[#C9D5D5]/60 rounded-2xl bg-slate-50/50">
                <ImageIcon size={32} className="mx-auto text-slate-400 stroke-[1.2]" />
                <p className="text-xs font-bold text-slate-500 mt-2">No Banners Configured</p>
                <p className="text-[10px] text-slate-400">Click the button above to add your first slide</p>
              </div>
            ) : (
              <div className="space-y-6">
                {banners.map((banner, index) => (
                  <div 
                    key={banner.id} 
                    className="p-5 border border-[#C9D5D5]/50 bg-[#FDFBF7]/40 rounded-2xl relative space-y-4 hover:border-[#1A5C5E]/30 transition-colors"
                  >
                    {/* Header bar of slide block */}
                    <div className="flex items-center justify-between border-b border-[#C9D5D5]/30 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                          SLIDE #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-[#134547]">
                          {banner.title || 'Untitled Banner'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveBanner(index, 'up')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === banners.length - 1}
                          onClick={() => handleMoveBanner(index, 'down')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveBanner(banner.id)}
                          className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400 cursor-pointer transition-colors"
                          title="Delete Slide"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Form fields layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left: Titles & Copy */}
                      <div className="space-y-3">
                        <AdminInput
                          label="Main Title Text *"
                          value={banner.title || ''}
                          onChange={(e) => handleBannerChange(banner.id, 'title', e.target.value)}
                          placeholder="e.g. Moon Light"
                        />
                        <AdminInput
                          label="Subtitle / Second Line Text"
                          value={banner.subtitle || ''}
                          onChange={(e) => handleBannerChange(banner.id, 'subtitle', e.target.value)}
                          placeholder="e.g. Cream"
                        />
                        <AdminInput
                          label="Action Button Link (Product ID or Category)"
                          value={banner.link_url || ''}
                          onChange={(e) => handleBannerChange(banner.id, 'link_url', e.target.value)}
                          placeholder="e.g. moon-light-cream"
                        />
                      </div>

                      {/* Middle: Description copy & Display Switch */}
                      <div className="space-y-3">
                        <AdminTextarea
                          label="Description Copy"
                          value={banner.description || ''}
                          onChange={(e) => handleBannerChange(banner.id, 'description', e.target.value)}
                          placeholder="Short tagline context..."
                          rows={3.5}
                        />
                        <AdminSelect
                          label="Slide Status"
                          value={banner.is_active ? 'active' : 'inactive'}
                          onChange={(val) => handleBannerChange(banner.id, 'is_active', val === 'active')}
                          options={[
                            { value: 'active', label: 'Active (Visible on homepage)' },
                            { value: 'inactive', label: 'Inactive (Hidden)' }
                          ]}
                        />
                      </div>

                      {/* Right: Responsive Image Uploaders */}
                      <div className="space-y-3 border-l border-slate-100 pl-0 md:pl-4">
                        <AdminImageUploader
                          label="Desktop Banner Image (1600x680px) *"
                          value={banner.desktop_image_url || ''}
                          onChange={(url) => handleBannerChange(banner.id, 'desktop_image_url', url)}
                          folder="hero-section"
                        />
                        <div className="border-t border-slate-100 pt-3" />
                        <AdminImageUploader
                          label="Mobile Banner Image (800x620px) *"
                          value={banner.mobile_image_url || ''}
                          onChange={(url) => handleBannerChange(banner.id, 'mobile_image_url', url)}
                          folder="hero-section"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          {/* Action Footer for Banners */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#C9D5D5]/40">
            <button
              type="button"
              disabled={isSubmitting || bannersLoading}
              onClick={handleSaveBanners}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Save size={14} />
              <span>Save Carousel Config</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: PRODUCT MEDIA
          ============================================================ */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <AdminCard className="bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="border-b border-[#C9D5D5]/40 pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#134547] m-0">Product Image Assets Manager</h3>
              <p className="text-xs text-slate-500 m-0">Quickly upload and update main images and transparent background images for all products in the catalog</p>
            </div>

            {productsLoading ? (
              <AdminSkeleton type="table" />
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No products found in catalog. Create some products first.
              </div>
            ) : (
              <div className="space-y-6">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="p-5 border border-[#C9D5D5]/50 bg-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#1A5C5E]/30 transition-all"
                  >
                    {/* Product Name */}
                    <div className="flex items-center gap-3 md:w-1/4">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <ImageIcon size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#134547] m-0 leading-tight">{product.name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ID: {product.id}</span>
                      </div>
                    </div>

                    {/* Media Uploaders */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-6 border-l-0 md:border-l border-slate-100">
                      <AdminImageUploader
                        label="Main Product Card Image"
                        value={product.image || ''}
                        onChange={(url) => handleProductMediaChange(product.id, 'image', url)}
                        folder={`products/${product.id}`}
                      />
                      <AdminImageUploader
                        label="Transparent BG Zoom Image"
                        value={product.transparent_image || ''}
                        onChange={(url) => handleProductMediaChange(product.id, 'transparent_image', url)}
                        folder={`products/${product.id}`}
                      />
                    </div>

                    {/* Quick Save button per product */}
                    <div className="flex items-center justify-end md:w-32 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <button
                        type="button"
                        disabled={productSavingId === product.id}
                        onClick={() => handleSaveProductMedia(product.id)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        {productSavingId === product.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save size={13} />
                        )}
                        <span>Save Media</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}
