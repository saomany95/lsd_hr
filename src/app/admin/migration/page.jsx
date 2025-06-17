'use client';

import { useState } from 'react';
import { useUserEmployee } from '@/hooks/useUserEmployee';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Download, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DataMigration() {
  const { loading, error, migrateToNewStructure } = useUserEmployee();
  const [migrationResults, setMigrationResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleMigration = async () => {
    if (loading) return;

    const confirm = window.confirm(
      'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍ້າຍຂໍ້ມູນຈາກໂຄງສ້າງເກົ່າໄປຍັງໂຄງສ້າງໃໝ່? ຂໍແນະນຳໃຫ້ສຳຮອງຖານຂໍ້ມູນກ່ອນດຳເນີນການຕໍ່.'
    );

    if (!confirm) return;

    const toastId = toast.loading('ກຳລັງຍ້າຍຂໍ້ມູນ... ກະລຸນາລໍຖ້າ');

    try {
      const results = await migrateToNewStructure();
      setMigrationResults(results);
      setShowResults(true);
      toast.success('ຍ້າຍຂໍ້ມູນສຳເລັດແລ້ວ!', { id: toastId });
    } catch (err) {
      console.error('Migration error:', err);
      toast.error(`ເກີດຂໍ້ຜິດພາດ: ${err.message || 'ບໍ່ສາມາດຍ້າຍຂໍ້ມູນໄດ້'}`, { id: toastId });
    }
  };

  const downloadResults = () => {
    if (!migrationResults) return;

    const dataStr = JSON.stringify(migrationResults, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `migration-results-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">ການຍ້າຍຂໍ້ມູນໄປຍັງໂຄງສ້າງໃໝ່</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-start mb-4">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">ການຍ້າຍຂໍ້ມູນ</h2>
            <p className="text-gray-600 mb-4">
              ເຄື່ອງມືນີ້ຈະຍ້າຍຂໍ້ມູນຈາກໂຄງສ້າງເກົ່າ (ເອກະສານຜູ້ໃຊ້ລວມຂໍ້ມູນພະນັກງານ) ໄປຍັງໂຄງສ້າງໃໝ່ (ແຍກຂໍ້ມູນຜູ້ໃຊ້ແລະພະນັກງານ).
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>ຄຳເຕືອນ:</strong> ກະລຸນາສຳຮອງຖານຂໍ້ມູນກ່ອນດຳເນີນການຕໍ່. ຂະບວນການນີ້ຈະສ້າງຂໍ້ມູນໃໝ່ໃນຄອລເລກຊັນ <code>users</code> ແລະ <code>employees</code>.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleMigration}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                  ກຳລັງຍ້າຍຂໍ້ມູນ...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-5 w-5" />
                  ເລີ່ມການຍ້າຍຂໍ້ມູນ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {showResults && migrationResults && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">ຜົນການຍ້າຍຂໍ້ມູນ</h2>
            <button
              onClick={downloadResults}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center text-sm"
            >
              <Download className="mr-1 h-4 w-4" />
              ດາວໂຫຼດຜົນການຍ້າຍຂໍ້ມູນ
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ຜົນການຍ້າຍຂໍ້ມູນຜູ້ໃຊ້ */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-2 border-b">
                <h3 className="font-medium">ຜູ້ໃຊ້ ({migrationResults.userMigration?.length || 0} ລາຍການ)</h3>
              </div>
              <div className="h-60 overflow-y-auto p-2">
                {migrationResults.userMigration?.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID ເກົ່າ
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID ໃໝ່
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ສະຖານະ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {migrationResults.userMigration.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            {result.oldId}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            {result.newId}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {result.status === 'created' ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> ສ້າງໃໝ່
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                <RefreshCw className="h-3.5 w-3.5 mr-1" /> ອັບເດດ
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    ບໍ່ມີຂໍ້ມູນການຍ້າຍ
                  </div>
                )}
              </div>
            </div>
            
            {/* ຜົນການຍ້າຍຂໍ້ມູນພະນັກງານ */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-2 border-b">
                <h3 className="font-medium">ພະນັກງານ ({migrationResults.employeeMigration?.length || 0} ລາຍການ)</h3>
              </div>
              <div className="h-60 overflow-y-auto p-2">
                {migrationResults.employeeMigration?.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID ຜູ້ໃຊ້
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID ພະນັກງານ
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ສະຖານະ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {migrationResults.employeeMigration.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            {result.userId}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                            {result.employeeId}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {result.status === 'created' ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> ສ້າງໃໝ່
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                <RefreshCw className="h-3.5 w-3.5 mr-1" /> ອັບເດດ
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    ບໍ່ມີຂໍ້ມູນການຍ້າຍ
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">ຄຳແນະນຳຫຼັງຈາກການຍ້າຍຂໍ້ມູນ</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>ກວດສອບຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນໃນຄອລເລກຊັນ <code>users</code> ແລະ <code>employees</code></li>
              <li>ອັບເດດ Firebase Context ເພື່ອໃຊ້ງານໂຄງສ້າງຂໍ້ມູນໃໝ່</li>
              <li>ປັບປຸງສ່ວນຕິດຕໍ່ຜູ້ໃຊ້ເພື່ອສະແດງຂໍ້ມູນຈາກໂຄງສ້າງໃໝ່</li>
              <li>ທົດສອບການເຮັດວຽກຂອງລະບົບທັງໝົດກ່ອນນຳໃຊ້ຢ່າງເປັນທາງການ</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
} 