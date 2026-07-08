'use client';
import React, { useState, useEffect } from 'react';
import { useTranslationStore } from '@/store/translationStore';
import { checkHealthMyMemory, checkHealthLibreTranslate } from '@/lib/translation/providers';
import { TranslationProviderHealth } from '@/types/models';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/localization';

export default function TranslationSettingsPage() {
  const { settings, updateSettings, translationCache, clearCache } = useTranslationStore();
  const t = useTranslation(settings.uiLanguage);
  const [healthStatus, setHealthStatus] = useState<TranslationProviderHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckHealth = async () => {
    setIsChecking(true);
    try {
      let status: TranslationProviderHealth;
      if (settings.activeProvider === 'MYMEMORY_PUBLIC_NO_KEY') {
        status = await checkHealthMyMemory(settings.myMemoryContactEmail);
      } else if (settings.activeProvider === 'LIBRETRANSLATE_PUBLIC_NO_KEY') {
        status = await checkHealthLibreTranslate(settings.libreTranslateEndpoint || '');
      } else {
        status = { provider: settings.activeProvider, status: 'UNAVAILABLE', koToViOk: false, viToKoOk: false, requiresApiKey: false, corsOk: true, lastCheckedAt: new Date().toISOString() };
      }
      setHealthStatus(status);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (settings.activeProvider !== 'DISABLED' && settings.activeProvider !== 'MANUAL_ONLY') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleCheckHealth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.activeProvider]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-2xl font-bold text-[var(--color-text-main)]">{t('translationSettings')}</h1>
      
      <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-[var(--color-border)] space-y-6">
        <h2 className="text-lg font-bold border-b pb-2">기본 환경</h2>
        
        <div>
          <label className="block text-sm font-bold text-[var(--color-text-sub)] mb-2">기본 UI 언어</label>
          <div className="flex gap-4">
            <button
              onClick={() => updateSettings({ uiLanguage: 'ko' })}
              className={`px-4 py-2 border rounded-md transition-colors ${settings.uiLanguage === 'ko' ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
            >
              한국어 (Korean)
            </button>
            <button
              onClick={() => updateSettings({ uiLanguage: 'vi' })}
              className={`px-4 py-2 border rounded-md transition-colors ${settings.uiLanguage === 'vi' ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
            >
              Tiếng Việt (Vietnamese)
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer mt-4">
            <input 
              type="checkbox" 
              checked={settings.autoTranslateEnabled}
              onChange={(e) => updateSettings({ autoTranslateEnabled: e.target.checked })}
              className="w-5 h-5 accent-blue-600"
            />
            <span className="font-bold text-[var(--color-text-main)]">업무카드 자동번역 활성화</span>
          </label>
          <p className="text-sm text-[var(--color-text-sub)] mt-1 ml-7">새로운 업무카드가 작성될 때 자동으로 타겟 언어로 번역합니다.</p>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-[var(--color-border)] space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">무료 번역 제공자 설정 (Provider)</h2>
          <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-bold border border-red-100">API Key 불필요</span>
        </div>

        <div className="bg-orange-50/50 border border-orange-200 p-4 rounded-md text-sm text-orange-800 flex gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-orange-500" />
          <p className="font-medium leading-relaxed">{t('apiWarning')}</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--color-text-sub)] mb-2">활성 번역 제공자</label>
          <select 
            value={settings.activeProvider}
            onChange={(e) => updateSettings({ activeProvider: e.target.value as 'MYMEMORY_PUBLIC_NO_KEY' | 'LIBRETRANSLATE_PUBLIC_NO_KEY' | 'MANUAL_ONLY' | 'DISABLED' })}
            className="w-full md:w-1/2 p-2 border rounded-md bg-[var(--color-bg)] focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="MYMEMORY_PUBLIC_NO_KEY">MyMemory (무료, 일 500자 제한, 이메일 제공 시 5000자)</option>
            <option value="LIBRETRANSLATE_PUBLIC_NO_KEY">LibreTranslate (무료 미러 서버)</option>
            <option value="MANUAL_ONLY">수동 번역만 (자동번역 끄기)</option>
            <option value="DISABLED">완전 비활성화</option>
          </select>
        </div>

        {settings.activeProvider === 'MYMEMORY_PUBLIC_NO_KEY' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-bold text-[var(--color-text-sub)] mb-2">연락처 이메일 (선택)</label>
            <input 
              type="email" 
              value={settings.myMemoryContactEmail || ''}
              onChange={(e) => updateSettings({ myMemoryContactEmail: e.target.value })}
              placeholder="user@example.com"
              className="w-full md:w-1/2 p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">입력 시 하루 500단어에서 5000단어로 제한이 상향됩니다.</p>
          </div>
        )}

        {settings.activeProvider === 'LIBRETRANSLATE_PUBLIC_NO_KEY' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-bold text-[var(--color-text-sub)] mb-2">엔드포인트 URL</label>
            <input 
              type="text" 
              value={settings.libreTranslateEndpoint || ''}
              onChange={(e) => updateSettings({ libreTranslateEndpoint: e.target.value })}
              placeholder="https://translate.terraprint.co"
              className="w-full md:w-1/2 p-2 border rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">인증 키가 필요 없는 퍼블릭 미러 주소를 입력하세요.</p>
          </div>
        )}

        {(settings.activeProvider === 'MYMEMORY_PUBLIC_NO_KEY' || settings.activeProvider === 'LIBRETRANSLATE_PUBLIC_NO_KEY') && (
          <div className="bg-[var(--color-bg)]/50 p-4 rounded-md border mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Provider 상태 검사</h3>
              <button 
                onClick={handleCheckHealth}
                disabled={isChecking}
                className="text-xs bg-[var(--color-surface)] border px-3 py-1.5 rounded hover:bg-gray-50 disabled:opacity-50 font-bold shadow-sm transition-colors"
              >
                {isChecking ? '검사 중...' : '지금 검사'}
              </button>
            </div>
            
            {healthStatus ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-[var(--color-surface)] p-3 rounded border">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">상태:</span>
                  {healthStatus.status === 'AVAILABLE' ? <span className="text-green-600 flex gap-1 items-center font-bold"><CheckCircle className="w-4 h-4" /> 정상</span> : 
                   healthStatus.status === 'LIMITED' ? <span className="text-orange-500 flex gap-1 items-center font-bold"><AlertTriangle className="w-4 h-4" /> 한도초과</span> : 
                   <span className="text-red-500 flex gap-1 items-center font-bold"><XCircle className="w-4 h-4" /> 불가</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">KO-VI:</span>
                  {healthStatus.koToViOk ? <span className="text-green-600 font-bold">OK</span> : <span className="text-red-500 font-bold">FAIL</span>}
                </div>
                <div className="col-span-2 text-xs text-gray-400 flex items-center justify-end">
                  최근 검사: {new Date(healthStatus.lastCheckedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">검사 결과가 없습니다.</div>
            )}
          </div>
        )}
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-[var(--color-border)] space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">캐시 관리</h2>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[var(--color-text-sub)]">
            현재 저장된 로컬 번역 캐시 개수: <strong className="text-[var(--color-text-main)] text-lg">{translationCache.length}</strong>개
          </p>
          <button 
            onClick={() => {
              if (window.confirm('저장된 번역 캐시를 모두 삭제하시겠습니까? (이전에 번역된 항목이 다시 API를 호출하게 됩니다)')) {
                clearCache();
              }
            }}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-bold hover:bg-red-100 transition-colors"
          >
            캐시 비우기
          </button>
        </div>
      </div>
    </div>
  );
}
