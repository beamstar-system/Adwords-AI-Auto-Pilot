import React, { useState } from 'react';
import { AdPreview } from './components/AdPreview';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CampaignData, Step, BusinessInfo, CampaignStrategy, Keyword, AdCreative } from './types';
import * as gemini from './services/geminiService';

// Icons
const CheckIcon = () => <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const ChevronRight = () => <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.BusinessInfo);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<CampaignData>({
    businessInfo: {
      name: '',
      website: '',
      description: '',
      audience: '',
      budget: '',
    },
    strategy: null,
    keywords: [],
    adCreative: null,
  });

  // Handlers for updating Business Info
  const updateBusinessInfo = (field: keyof BusinessInfo, value: string) => {
    setData(prev => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, [field]: value }
    }));
  };

  // --- Wizard Actions ---

  const handleGenerateStrategy = async () => {
    if (!data.businessInfo.name || !data.businessInfo.description) return;
    setLoading(true);
    try {
      const strategy = await gemini.generateStrategy(data.businessInfo);
      setData(prev => ({ ...prev, strategy }));
      setCurrentStep(Step.Strategy);
    } catch (e) {
      console.error(e);
      alert("Failed to generate strategy. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKeywords = async () => {
    if (!data.strategy) return;
    setLoading(true);
    try {
      const keywords = await gemini.generateKeywords(data.businessInfo, data.strategy);
      setData(prev => ({ ...prev, keywords }));
      setCurrentStep(Step.Keywords);
    } catch (e) {
      console.error(e);
      alert("Failed to generate keywords.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCreative = async () => {
    setLoading(true);
    try {
      const creative = await gemini.generateAdCreative(data.businessInfo, data.keywords);
      setData(prev => ({ ...prev, adCreative: creative }));
      setCurrentStep(Step.AdCreative);
    } catch (e) {
      console.error(e);
      alert("Failed to generate creatives.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = () => {
    setCurrentStep(Step.Review);
  };

  // --- Render Steps ---

  const renderProgressBar = () => {
    const steps = [
      { id: Step.BusinessInfo, label: "Business Info" },
      { id: Step.Strategy, label: "Strategy" },
      { id: Step.Keywords, label: "Keywords" },
      { id: Step.AdCreative, label: "Ads" },
      { id: Step.Review, label: "Review" },
    ];

    return (
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 google-sans">
              <span className="text-blue-600">AdWords</span> AI Auto-Pilot
            </h1>
            <div className="flex space-x-2">
               {/* Simple progress visual for mobile/desktop */}
               {steps.map((s, idx) => (
                 <div key={s.id} className={`flex items-center ${idx !== steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-colors
                      ${currentStep > s.id ? 'bg-blue-600 border-blue-600 text-white' : 
                        currentStep === s.id ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                      {currentStep > s.id ? <CheckIcon /> : s.id + 1}
                    </div>
                    {/* Label (hidden on small screens) */}
                    <span className={`hidden md:block ml-2 text-sm font-medium ${currentStep === s.id ? 'text-gray-800' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                    {idx !== steps.length - 1 && (
                      <div className={`hidden md:block w-8 h-0.5 mx-2 ${currentStep > s.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 0: Input
  const renderBusinessInfo = () => (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 google-sans">Tell us about your business</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g. Acme Solar Solutions"
              value={data.businessInfo.name}
              onChange={(e) => updateBusinessInfo('name', e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g. www.acmesolar.com"
              value={data.businessInfo.website}
              onChange={(e) => updateBusinessInfo('website', e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">What do you sell/offer?</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition h-24"
              placeholder="Describe your products or services in detail..."
              value={data.businessInfo.description}
              onChange={(e) => updateBusinessInfo('description', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g. Homeowners in California"
              value={data.businessInfo.audience}
              onChange={(e) => updateBusinessInfo('audience', e.target.value)}
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (Approx)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g. $2000"
              value={data.businessInfo.budget}
              onChange={(e) => updateBusinessInfo('budget', e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleGenerateStrategy}
          disabled={!data.businessInfo.name || !data.businessInfo.description}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Analyzing...' : 'Generate Strategy'}
          {!loading && <ChevronRight />}
        </button>
      </div>
    </div>
  );

  // Step 1: Strategy
  const renderStrategy = () => (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">AI Strategy Analysis</h3>
          <p className="text-blue-800 leading-relaxed">{data.strategy?.rationale}</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Campaign Goal</div>
             <div className="text-xl font-bold text-gray-800">{data.strategy?.goal}</div>
             <p className="text-sm text-gray-500 mt-2">Optimized for your business type.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Bidding Strategy</div>
             <div className="text-xl font-bold text-gray-800">{data.strategy?.biddingStrategy}</div>
             <p className="text-sm text-gray-500 mt-2">To maximize your budget efficiency.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Networks</div>
             <div className="flex flex-wrap gap-2 mt-2">
                {data.strategy?.networks.map(n => (
                   <span key={n} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">{n}</span>
                ))}
             </div>
          </div>
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Target Locations</div>
             <div className="flex flex-wrap gap-2 mt-2">
                {data.strategy?.locations.map(l => (
                   <span key={l} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{l}</span>
                ))}
             </div>
          </div>
       </div>

       <div className="flex justify-between pt-6">
         <button onClick={() => setCurrentStep(Step.BusinessInfo)} className="text-gray-600 hover:text-gray-900 font-medium">Back</button>
         <button
          onClick={handleGenerateKeywords}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center shadow-md transition"
        >
          {loading ? 'Finding Keywords...' : 'Approve & Find Keywords'}
          {!loading && <ChevronRight />}
        </button>
       </div>
    </div>
  );

  // Step 2: Keywords
  const renderKeywords = () => (
    <div className="max-w-5xl mx-auto space-y-6">
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
             <div>
                <h3 className="text-lg font-bold text-gray-800">Keyword Plan</h3>
                <p className="text-sm text-gray-500">AI identified {data.keywords.length} high-potential keywords.</p>
             </div>
             <button className="text-blue-600 text-sm font-medium hover:underline">+ Add Manually</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                     <th className="px-6 py-3 font-medium">Keyword</th>
                     <th className="px-6 py-3 font-medium">Match Type</th>
                     <th className="px-6 py-3 font-medium">Intent</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {data.keywords.map((k, i) => (
                     <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{k.text}</td>
                        <td className="px-6 py-4">
                           <span className={`text-xs px-2 py-1 rounded-full font-medium
                              ${k.matchType === 'Exact' ? 'bg-red-100 text-red-800' : 
                                k.matchType === 'Phrase' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                              {k.matchType}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{k.intent}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>
       </div>

       <div className="flex justify-between pt-6">
         <button onClick={() => setCurrentStep(Step.Strategy)} className="text-gray-600 hover:text-gray-900 font-medium">Back</button>
         <button
          onClick={handleGenerateCreative}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center shadow-md transition"
        >
          {loading ? 'Writing Ads...' : 'Approve & Create Ads'}
          {!loading && <ChevronRight />}
        </button>
       </div>
    </div>
  );

  // Step 3: Creative
  const renderCreative = () => {
    // Helper to allow simple selection (mock state for now)
    const [selectedHeadline, setSelectedHeadline] = useState(0);
    const [selectedDesc, setSelectedDesc] = useState(0);

    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
               <h3 className="text-lg font-bold text-gray-800 mb-4">Generated Headlines</h3>
               <div className="space-y-3">
                  {data.adCreative?.headlines.map((h, i) => (
                     <div 
                        key={i} 
                        onClick={() => setSelectedHeadline(i)}
                        className={`p-3 border rounded-md cursor-pointer transition-all ${selectedHeadline === i ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                     >
                        <div className="flex justify-between">
                           <span className="text-gray-800 font-medium">{h}</span>
                           <span className="text-xs text-gray-400">{h.length}/30</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
               <h3 className="text-lg font-bold text-gray-800 mb-4">Generated Descriptions</h3>
               <div className="space-y-3">
                  {data.adCreative?.descriptions.map((d, i) => (
                     <div 
                        key={i} 
                        onClick={() => setSelectedDesc(i)}
                        className={`p-3 border rounded-md cursor-pointer transition-all ${selectedDesc === i ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                     >
                        <div className="flex justify-between gap-4">
                           <span className="text-gray-800 text-sm leading-relaxed">{d}</span>
                           <span className="text-xs text-gray-400 whitespace-nowrap">{d.length}/90</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="sticky top-24">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Live Ad Preview</h3>
               {data.adCreative && (
                 <AdPreview 
                    headline={data.adCreative.headlines[selectedHeadline]}
                    headlinePart2={data.adCreative.headlines[(selectedHeadline + 1) % data.adCreative.headlines.length]} // Mock second headline
                    description={data.adCreative.descriptions[selectedDesc]}
                    displayUrl={data.businessInfo.website}
                 />
               )}
               <div className="mt-8 bg-gray-100 p-4 rounded text-sm text-gray-600">
                  <p><strong>AI Tip:</strong> This combination uses keyword-rich headlines and an action-oriented description to maximize CTR.</p>
               </div>

               <div className="flex justify-end pt-8 gap-4">
                  <button onClick={() => setCurrentStep(Step.Keywords)} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">Back</button>
                  <button
                     onClick={handleFinalize}
                     className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium flex items-center shadow-md transition"
                  >
                     Finalize Campaign
                     <ChevronRight />
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  };

  // Step 4: Review
  const renderReview = () => (
     <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
           </div>
           <h2 className="text-3xl font-bold text-gray-900 mb-2 google-sans">Campaign Ready to Launch!</h2>
           <p className="text-gray-600">Your fully optimized Google Ads campaign has been generated.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
           <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Campaign Summary</h3>
           </div>
           <div className="p-6 grid grid-cols-2 gap-8">
              <div>
                 <p className="text-sm text-gray-500">Business</p>
                 <p className="font-medium">{data.businessInfo.name}</p>
              </div>
              <div>
                 <p className="text-sm text-gray-500">Goal</p>
                 <p className="font-medium">{data.strategy?.goal}</p>
              </div>
              <div>
                 <p className="text-sm text-gray-500">Keywords</p>
                 <p className="font-medium">{data.keywords.length} keywords selected</p>
              </div>
              <div>
                 <p className="text-sm text-gray-500">Budget</p>
                 <p className="font-medium">{data.businessInfo.budget} / month</p>
              </div>
           </div>
           <div className="bg-gray-50 p-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                 Estimated setup time saved: <span className="font-bold text-gray-800">2-3 hours</span>
              </div>
              <div className="flex gap-3">
                 <button className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50">Download CSV</button>
                 <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 shadow-md">Export to Google Ads</button>
              </div>
           </div>
        </div>
        
        <div className="text-center">
           <button onClick={() => window.location.reload()} className="text-blue-600 hover:underline">Start New Campaign</button>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 font-roboto">
      {renderProgressBar()}
      
      <main className="px-4 pt-10">
        {loading ? (
          <LoadingSpinner message={
            currentStep === Step.BusinessInfo ? "Analyzing your business..." :
            currentStep === Step.Strategy ? "Researching high-intent keywords..." :
            currentStep === Step.Keywords ? "Writing persuasive ad copy..." : "Processing..."
          } />
        ) : (
          <>
            {currentStep === Step.BusinessInfo && renderBusinessInfo()}
            {currentStep === Step.Strategy && renderStrategy()}
            {currentStep === Step.Keywords && renderKeywords()}
            {currentStep === Step.AdCreative && renderCreative()}
            {currentStep === Step.Review && renderReview()}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
