import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/components/context/TranslationContext'
import { isRTL } from '@/utils/helperFunction'
import { FaDownload, FaFile, FaCloudUploadAlt } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import ImageWithPlaceholder from '@/components/image-with-placeholder/ImageWithPlaceholder'
const FacilitiesComponent = ({
    formData,
    setFormData,
    selectedCategory,
    categories,
    handleCheckRequiredFields,
    isEditing = false
}) => {
    const t = useTranslation()
    const isRtl = isRTL()
    const [categoryData, setCategoryData] = useState(null);
    const [parameterTypes, setParameterTypes] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState({});

    useEffect(() => {
        if (selectedCategory) {
            // Find the selected category data from categories in Redux
            const category = categories.find(cat => cat.id === selectedCategory?.id);
            if (category) {
                setParameterTypes(typeof category.parameter_types === "object" ? Object.values(category.parameter_types) : category.parameter_types);

                // Check for existing file values in formData and set in uploadedFiles
                if (isEditing && Object.keys(formData).length > 0) {
                    const fileParams = (typeof category.parameter_types === "object" ? Object.values(category.parameter_types) : category.parameter_types)
                        .filter(param => param.type_of_parameter === 'file');

                    const existingFiles = {};
                    fileParams.forEach(param => {
                        const fileValue = formData[param.id];
                        if (fileValue && typeof fileValue === 'string' && (fileValue.startsWith('http') || fileValue.startsWith('/'))) {
                            // If it's a URL, it's an existing file
                            existingFiles[param.id] = {
                                name: fileValue.split('/').pop(),
                                type: fileValue.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image/jpeg' : 'application/octet-stream',
                                size: 0,
                                isExisting: true,
                                url: fileValue
                            };
                        }
                    });

                    if (Object.keys(existingFiles).length > 0) {
                        setUploadedFiles(prev => ({
                            ...prev,
                            ...existingFiles
                        }));
                    }
                }
            }
            setCategoryData(category);
        } else {
            setCategoryData(null);
        }
    }, [selectedCategory, categories, formData, isEditing]);

    const handleInputChange = (e, parameter) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "file") {
            const file = files?.[0];
            if (!file) return;

            const maxSize = 3 * 1024 * 1024; // 3MB

            if (file.size > maxSize) {
                toast.error(t("fileSizeExceeded3MB"));
                // Clear the input value to prevent upload
                e.target.value = '';
                return;
            }

            // Handle file input for valid files
            setUploadedFiles(prev => ({
                ...prev,
                [parameter.id]: file
            }));
            setFormData(prev => ({
                ...prev,
                [parameter.id]: file
            }));
            return;
        }

        if (type === "number" && (value < 0 || parseFloat(value) < 0 || isNaN(value))) {
            setFormData(prev => ({
                ...prev,
                [name]: 0
            }));
            return;
        }

        if (type === "checkbox") {
            // Handle checkbox inputs (multiple values)
            let currentValues = formData[name] || [];

            // Convert comma-separated string to array if needed
            if (typeof currentValues === 'string' && currentValues?.includes(",")) {
                currentValues = currentValues?.split(",");
            }

            // Ensure currentValues is always an array
            if (!Array.isArray(currentValues)) {
                currentValues = currentValues ? [currentValues] : [];
            }

            // Add or remove the value
            const updatedValues = checked
                ? [...currentValues, value]
                : currentValues.filter(val => val !== value);

            // If array is empty after unchecking, remove the field entirely
            if (updatedValues.length === 0) {
                setFormData(prev => {
                    const updated = { ...prev };
                    delete updated[name];
                    return updated;
                });
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: updatedValues
                }));
            }
        } else {
            // Handle other input types
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleRemoveFile = (parameterId) => {
        // Clear the file input value
        const fileInput = document.getElementById(parameterId);
        if (fileInput) {
            fileInput.value = '';
        }

        setUploadedFiles(prev => {
            const updated = { ...prev };
            delete updated[parameterId];
            return updated;
        });

        setFormData(prev => {
            const updated = { ...prev };
            delete updated[parameterId];
            return updated;
        });
    };

    // Handle file drop via dropzone
    const handleFileDrop = useCallback((acceptedFiles, parameter) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const maxSize = 3 * 1024 * 1024; // 3MB

        if (file.size > maxSize) {
            toast.error(t("fileSizeExceeded3MB"));
            return;
        }

        // Handle file input for valid files
        setUploadedFiles(prev => ({
            ...prev,
            [parameter.id]: file
        }));

        setFormData(prev => ({
            ...prev,
            [parameter.id]: file
        }));
    }, [t]);

    const getFileIcon = (file) => {
        if (file.type?.startsWith('image/') || (file.isExisting && file.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.url))) {
            return <FaFile className="w-4 h-4" />;
        }
        return <FaFile className="w-4 h-4" />;
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 ' + t("bytes");
        const k = 1024;
        const sizes = [t("bytes"), t("kb"), t("mb")];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!selectedCategory) {
        return (
            <div className="flex items-center justify-center p-8 rounded-md">
                <p className="text-muted-foreground">{t("pleaseSelectACategory")}</p>
            </div>
        );
    }

    if (!categoryData) {
        return (
            <div className="flex items-center justify-center p-8">
                <p>{t("categoryLoading")}</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {parameterTypes && parameterTypes.map((parameter) => (
                    <div key={parameter.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label htmlFor={parameter.translated_name || parameter?.name} className="font-medium text-sm">
                                {parameter.translated_name || parameter.name}
                                {parameter.is_required === 1 && <span className="text-red-500 ml-1">*</span>}
                            </label>
                        </div>

                        {/* Render different input types based on parameter type */}
                        {parameter.type_of_parameter === "textbox" && (
                            <Input
                                id={parameter.name}
                                name={parameter.id}
                                value={formData[parameter.id] || ""}
                                onChange={(e) => handleInputChange(e, parameter)}
                                required={parameter.is_required === 1}
                                className="primaryBackgroundBg"
                            />
                        )}

                        {parameter.type_of_parameter === "textarea" && (
                            <Textarea
                                id={parameter.name}
                                name={parameter.id}
                                value={formData[parameter.id] || ""}
                                onChange={(e) => handleInputChange(e, parameter)}
                                required={parameter.is_required === 1}
                                className="primaryBackgroundBg resize-none"
                            />
                        )}

                        {parameter.type_of_parameter === "number" && (
                            <Input
                                id={parameter.name}
                                name={parameter.id}
                                type="number"
                                value={formData[parameter.id] || ""}
                                onChange={(e) => handleInputChange(e, parameter)}
                                required={parameter.is_required === 1}
                                onInput={(e) => {
                                    if (e.target.value < 0) {
                                        e.target.value = 0;
                                    }
                                }}
                                className="primaryBackgroundBg"
                            />
                        )}

                        {parameter.type_of_parameter === "dropdown" && (
                            <Select
                                dir={isRtl ? "rtl" : "ltr"}
                                value={formData[parameter.id] || ""}
                                onValueChange={(value) =>
                                    setFormData(prev => ({ ...prev, [parameter.id]: value }))
                                }
                            >
                                <SelectTrigger className="w-full focus:ring-0">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {parameter.translated_option_value && parameter.translated_option_value.map((option, index) => (
                                        <SelectItem key={option?.translated} value={option?.value} className="hover:!primaryBg hover:!text-white hover:!cursor-pointer">
                                            {option?.translated || option?.value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {parameter.type_of_parameter === "radiobutton" && (
                            <div className="flex flex-col w-fit items-start gap-2">
                                {parameter.translated_option_value && parameter.translated_option_value.map((option, index) => (
                                    <label
                                        key={option?.id}
                                        className={`px-3 py-2 rounded border cursor-pointer transition-colors ${formData[parameter.id] === option?.value
                                            ? "primaryBg text-white"
                                            : "hover:bg-muted"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={parameter.id}
                                            value={option?.value}
                                            checked={formData[parameter.id] === option?.value}
                                            onChange={(e) => handleInputChange(e, parameter)}
                                            className="sr-only"
                                            required={parameter.is_required === 1}
                                        />
                                        {option?.translated || option?.value}
                                    </label>
                                ))}
                            </div>
                        )}
                        {parameter.type_of_parameter === "checkbox" && (
                            <div className="flex flex-col w-fit items-start gap-2">
                                {parameter.translated_option_value && parameter.translated_option_value.map((option, index) => (
                                    <label
                                        key={`${parameter.id}_${index}`}
                                        className={`px-3 py-2 rounded border cursor-pointer transition-colors ${(formData[parameter.id] || []).includes(option?.value)
                                            ? "primaryBg text-white"
                                            : "hover:bg-muted"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            name={parameter.id}
                                            value={option?.value}
                                            checked={(formData[parameter.id] || []).includes(option?.value)}
                                            onChange={(e) => handleInputChange(e, parameter)}
                                            className="sr-only"
                                        />
                                        {option?.translated || option?.value}
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* <Input
                                id={parameter.name}
                                name={parameter.id}
                                type="file"
                                accept="image/jpeg, image/png, image/jpg, image/gif, image/webp, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain"
                                onChange={(e) => handleInputChange(e, parameter)}
                                required={parameter.is_required === 1}
                            /> */}
                        {parameter.type_of_parameter === "file" && (
                            <div className="space-y-3">
                                {!uploadedFiles[parameter.id] ? (
                                    <FileDropZone
                                        parameter={parameter}
                                        onDrop={(acceptedFiles) => handleFileDrop(acceptedFiles, parameter)}
                                        required={parameter.is_required === 1}
                                        t={t}
                                    />
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-md border">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {uploadedFiles[parameter.id].isExisting ? (
                                                <>
                                                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(uploadedFiles[parameter.id].url) ? (
                                                        <ImageWithPlaceholder
                                                            src={uploadedFiles[parameter.id].url}
                                                            alt="File preview"
                                                            className="w-10 h-10 object-cover rounded-md"
                                                            width={40}
                                                            height={40}
                                                        />
                                                    ) : (
                                                        <FaFile className="w-4 h-4" />
                                                    )}
                                                </>
                                            ) : (
                                                getFileIcon(uploadedFiles[parameter.id])
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" title={uploadedFiles[parameter.id].name}>
                                                    {uploadedFiles[parameter.id].name}
                                                </p>
                                                {!uploadedFiles[parameter.id].isExisting && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(uploadedFiles[parameter.id].size)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {/* Preview Button for Images */}
                                            {((uploadedFiles[parameter.id].type && uploadedFiles[parameter.id].type.startsWith('image/')) ||
                                                (uploadedFiles[parameter.id].isExisting && /\.(jpg|jpeg|png|gif|webp)$/i.test(uploadedFiles[parameter.id].url))) && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const url = uploadedFiles[parameter.id].isExisting
                                                                ? uploadedFiles[parameter.id].url
                                                                : URL.createObjectURL(uploadedFiles[parameter.id]);
                                                            window.open(url, '_blank');
                                                        }}
                                                        aria-label={t("previewFile")}
                                                    >
                                                        <FaDownload className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            {/* Remove Button */}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFile(parameter.id)}
                                                aria-label={t("removeFile")}
                                            >
                                                <FaX className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* File upload guidelines */}
                                <div className="text-xs text-muted-foreground">
                                    <p>{t("acceptedFileTypes")}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-end mt-4">
                <Button
                    onClick={() => handleCheckRequiredFields("facilities", "outdoorFacilities")}
                    className="px-10 py-5"
                >
                    {isEditing ? t("save") : t("next")}
                </Button>
            </div>
        </>
    );
}

// File Dropzone Component
const FileDropZone = ({ parameter, onDrop, required, t }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        multiple: false,
        maxFiles: 1,
        maxSize: 3 * 1024 * 1024, // 3MB
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer transition-colors hover:border-gray-400 ${isDragActive ? 'primaryBorderColor bg-blue-50' : 'border-gray-300'
                }`}
        >
            <input {...getInputProps()} id={parameter.name} name={parameter.id} required={required} aria-label={t("uploadFile")} />
            <FaCloudUploadAlt className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            {isDragActive ? (
                <p className="text-sm">{t("dropFileHere")}</p>
            ) : (
                <>
                    <p className="text-sm">{t("dragAndDropFile")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("or")}</p>
                    <p className="text-xs primaryColor">{t("browseFiles")}</p>
                    {required && <p className="text-xs text-red-500 mt-1">* {t("required")}</p>}
                </>
            )}
        </div>
    );
};

export default FacilitiesComponent