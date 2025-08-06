import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getConfig } from '../config/activeConfig';

export default function AgreementUpload() {
  const [uniqueId, setUniqueId] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const config = getConfig();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file only');
        e.target.value = ''; // Clear the file input
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uniqueId || !clientEmail || !selectedFile) {
      toast.error('Please fill all fields and select a file');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Append the file with the new filename
      const renamedFile = new File([selectedFile], `${uniqueId}.pdf`, {
        type: 'application/pdf'
      });
      formData.append("file", renamedFile);
      
      // Append other fields
      formData.append("clientEmail", clientEmail);
      formData.append("uniqueId", uniqueId);
      formData.append("type","user");

      // Make the API call
      const response = await axios.post(
        `${config.healthCheck}/api/public/sendAgreement`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data && response.data.status === "Success") {
        toast.success("Agreement sent successfully!");
        // Reset form
        setUniqueId('');
        setClientEmail('');
        setSelectedFile(null);
        document.getElementById('file-upload').value = ''; // Clear file input
      } else {
        throw new Error(response.data?.message || "Failed to send agreement");
      }
    } catch (error) {
      console.error("Error sending agreement:", error);
      toast.error(error.message || "Failed to send agreement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 bg-[length:200%_200%] animate-gradient-flow">
          Upload 
        </span>&nbsp;Agreement
      </h1>

      <div className="max-w-xl mx-auto relative p-[2px] rounded-lg bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 animate-rotate-colors">
        <div className="bg-gray-900 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Unique ID *</label>
              <input
                type="text"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                placeholder="Enter unique ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Client Email *</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                placeholder="client@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Agreement PDF *</label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-750">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF only (MAX. 10MB)</p>
                  </div>
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    required
                  />
                </label>
              </div>
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-300">
                  Selected file: {selectedFile.name}
                </div>
              )}
            </div>

            <center>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-purple-700 hover:to-fuchsia-700'
                }`}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Agreement'}
              </button>
            </center>
          </form>
        </div>
      </div>
    </div>
  );
}