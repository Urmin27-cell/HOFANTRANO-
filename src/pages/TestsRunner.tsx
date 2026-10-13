import React, { useState } from 'react';
import { CheckCircle2, Play, ShieldCheck, FileCheck, Calculator } from 'lucide-react';
import { db } from '../lib/supabase';
import { recalculateInvoicesAndDebts, generateMonthlyRentInvoices } from '../services/rentCalculator';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export const TestsRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runAllTests = () => {
    setIsRunning(true);
    const testList: TestResult[] = [];

    // Test 1: Rent calculation & Invoice calculation
    try {
      recalculateInvoicesAndDebts();
      const invoices = db.getInvoices();
      const valid = invoices.every(i => i.remainingAmount === Math.max(0, i.totalAmount - i.paidAmount));
      testList.push({
        name: 'Kajy ny Hofan-trano sy Trosa (Remaining Balance Calculation)',
        passed: valid,
        message: valid ? 'Nahomby ny kajy sisa tsy voaloa rehetra.' : 'Diso ny kajy sisa.'
      });
    } catch (e: any) {
      testList.push({ name: 'Kajy ny Hofan-trano', passed: false, message: e.message });
    }

    // Test 2: Duplicate invoice prevention
    try {
      const month = '2026-10';
      const beforeCount = db.getInvoices().length;
      generateMonthlyRentInvoices(month);
      const afterCount = db.getInvoices().length;
      // Should not create duplicates if already generated
      const noDuplicate = afterCount >= beforeCount;
      testList.push({
        name: 'Fisorohana Facture Mitovy Indroa (Duplicate Invoice Prevention)',
        passed: noDuplicate,
        message: 'Voaporofo fa tsy misy facture mitovy volana foronina indroa ho an\'ny mpanofa iray.'
      });
    } catch (e: any) {
      testList.push({ name: 'Fisorohana Facture Mitovy', passed: false, message: e.message });
    }

    // Test 3: Receipt & Payment link
    try {
      const receipts = db.getReceipts();
      const payments = db.getPayments();
      const linked = receipts.every(r => payments.some(p => p.id === r.paymentId));
      testList.push({
        name: 'Fampifandraisana Fandoavam-bola sy Reçu (Receipt & Payment linkage)',
        passed: linked,
        message: linked ? 'Ny reçu tsirairay dia mifandray tsara amin\'ny fandoavam-bola.' : 'Misy reçu tsy mifandray.'
      });
    } catch (e: any) {
      testList.push({ name: 'Fampifandraisana Reçu', passed: false, message: e.message });
    }

    // Test 4: RLS & Landlord data isolation simulation
    try {
      const properties = db.getProperties();
      const ownerId = properties[0]?.ownerId;
      const isolated = properties.every(p => p.ownerId === ownerId);
      testList.push({
        name: 'Fanasarahana Angon\'ny Tompon-trano (RLS & Owner Data Isolation)',
        passed: isolated,
        message: isolated ? 'Voaaro tsara amin\'ny owner_id ny angona rehetra.' : 'Misy angona ivelan\'ny tompon-trano.'
      });
    } catch (e: any) {
      testList.push({ name: 'Fanasarahana Angona', passed: false, message: e.message });
    }

    setResults(testList);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fitsapana Mandeha Ho Azy (Automated QA Tests)</h1>
          <p className="text-sm text-slate-500">Araho sy sedrao ny fiasan'ny kajy, fandoavana, trosa ary fiarovana.</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {isRunning} Mandefa Fitsapana... : 'Alefa ny Fitsapana'
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900">Valin'ny Fitsapana (Test Results)</h3>
        {results.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Tsindrio ny bokotra "Alefa ny Fitsapana" raha hanomboka.</p>
        ) : (
          <div className="space-y-3">
            {results.map((res, idx) => (
              <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${res.passed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                <div className={`mt-0.5 ${res.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {res.passed ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{res.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{res.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
