'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Settings, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  
  const settingsOptions = [
    {
      title: 'ຕັ້ງຄ່າຕໍາແໜ່ງ',
      description: 'ກໍານົດຕໍາແໜ່ງ GPS ແລະ ເຄືອຂ່າຍ WiFi ທີ່ອະນຸຍາດໃຫ້ລົງເວລາໄດ້',
      icon: <MapPin className="h-8 w-8 text-blue-500" />,
      path: '/admin/settings/location'
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ຕັ້ງຄ່າລະບົບ</h1>
        <Button onClick={() => router.push('/admin')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          ກັບຄືນ
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsOptions.map((option, index) => (
          <Card 
            key={index} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(option.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                {option.icon}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <h3 className="font-medium text-lg mb-1">{option.title}</h3>
              <p className="text-gray-600 text-sm">{option.description}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link 
                href={option.path}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                ເຂົ້າເບິ່ງ
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 