'use client'
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { MdCancel } from 'react-icons/md';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="p-6 shadow-lg max-w-md text-center bg-white dark:bg-gray-800">
                <div className="flex justify-center mb-4">
                    <MdCancel className="text-red-500" size={60} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Payment Cancelled</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Your payment was not processed. If this was a mistake, please try again.
                </p>
                <Message severity="warn" text="No charges were made to your account." className="mb-4" />
                <Button 
                    label="Go to HomePage" 
                    icon="pi pi-refresh" 
                    className="p-button-danger w-full"
                    onClick={() => router.push('/')}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Need help? <a href="/support" className="text-blue-500">Contact Support</a>
                </p>
            </Card>
        </div>
    );
}