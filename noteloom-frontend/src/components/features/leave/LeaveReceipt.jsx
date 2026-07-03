import React from 'react';
import Barcode from 'react-barcode';
import { format } from 'date-fns';

export const LeaveReceipt = React.forwardRef(({ data, user }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref} className="p-10 bg-white text-gray-900 font-serif border border-gray-300 mx-auto max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase">Faculty Leave Application</h1>
          <p className="text-sm">Official Receipt • Noteloom System</p>
        </div>
        <div className="text-right">
             {/* Barcode for Scanning */}
            <Barcode value={data.leaveAppId} width={1.2} height={40} fontSize={12} />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-gray-50 border rounded">
          <h3 className="font-bold border-b pb-1 mb-2">Faculty Details</h3>
          <p><strong>Name:</strong> {user.fullName || user.username}</p>
          <p><strong>ID:</strong> {user.username}</p>
          <p><strong>Dept:</strong> {user.department}</p>
        </div>
        <div className="p-4 bg-gray-50 border rounded">
          <h3 className="font-bold border-b pb-1 mb-2">Application Info</h3>
          <p><strong>App ID:</strong> {data.leaveAppId}</p>
          <p><strong>Date Applied:</strong> {format(new Date(data.createdAt), 'PPP')}</p>
          <p><strong>Type:</strong> <span className="uppercase font-bold">{data.leaveType}</span></p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-2">Leave Request Details</h3>
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td className="border p-3 font-semibold bg-gray-100 w-1/4">Duration</td>
              <td className="border p-3">
                 {format(new Date(data.startDate), 'PPP')} <span className="mx-2">to</span> {format(new Date(data.endDate), 'PPP')}
              </td>
            </tr>
            <tr>
              <td className="border p-3 font-semibold bg-gray-100 align-top">Reason</td>
              <td className="border p-3 italic h-24 align-top">{data.reason}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="mt-16 flex justify-between">
        <div className="text-center border-t border-black w-1/3 pt-2">
            Signature of Faculty
        </div>
        <div className="text-center border-t border-black w-1/3 pt-2">
            Auth. Signature (Admin/HOD)
        </div>
      </div>
    </div>
  );
});