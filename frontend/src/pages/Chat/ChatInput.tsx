import {
    ClipboardEvent as ReactClipboardEvent,
    ChangeEvent,
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react";

import "./ChatInput.css";

interface ChatInputProps {
    onSend: (
        prompt: string,
        images: File[]
    ) => void;
    onStop?: () => void; // دالة إيقاف الطلب
    sending: boolean;
}

interface SelectedImage {
    file: File;
    url: string;
}

const ChatInput = ({
    onSend,
    onStop,
    sending,
}: ChatInputProps) => {
    const [prompt, setPrompt] = useState("");
    const [images, setImages] = useState<SelectedImage[]>([]);
    const imagesRef = useRef<SelectedImage[]>([]);

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);

    const textareaRef =
        useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    useEffect(() => {
        return () => {
            imagesRef.current.forEach((image) =>
                URL.revokeObjectURL(image.url)
            );
        };
    }, []);

    // Auto resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        textarea.style.height = "auto";

        const maxHeight = 160;

        if (textarea.scrollHeight <= maxHeight) {
            textarea.style.height = `${textarea.scrollHeight}px`;
            textarea.style.overflowY = "hidden";
        } else {
            textarea.style.height = `${maxHeight}px`;
            textarea.style.overflowY = "auto";
        }
    }, [prompt]);

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (sending) {
            return;
        }

        if (
            !prompt.trim() &&
            images.length === 0
        ) {
            return;
        }

        onSend(
            prompt,
            images.map((image) => image.file)
        );

        setPrompt("");
        setImages([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            if (
                !sending &&
                (prompt.trim() ||
                    images.length > 0)
            ) {
                event.currentTarget.form?.requestSubmit();
            }
        }
    };

    const handleImageChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFiles = Array.from(
            event.target.files || []
        );

        if (selectedFiles.length === 0) {
            event.target.value = "";
            return;
        }

        const selectedImages = selectedFiles.map(
            (file) => ({
                file,
                url: URL.createObjectURL(file),
            })
        );

        setImages((previousImages) => [
            ...previousImages,
            ...selectedImages,
        ]);

        event.target.value = "";
    };

    const handlePasteImages = (
        event: ReactClipboardEvent<HTMLTextAreaElement>
    ) => {
        const imageFiles = Array.from(
            event.clipboardData.items
        )
            .filter((item) =>
                item.type.startsWith("image/")
            )
            .map((item) => item.getAsFile())
            .filter(
                (file): file is File =>
                    file !== null
            );

        if (imageFiles.length === 0) {
            return;
        }

        const pastedImages = imageFiles.map(
            (file) => ({
                file,
                url: URL.createObjectURL(file),
            })
        );

        setImages((previousImages) => [
            ...previousImages,
            ...pastedImages,
        ]);

        event.preventDefault();
    };

    const handleRemoveImage = (
        imageIndex: number
    ) => {
        setImages((previousImages) => {
            const imageToRemove =
                previousImages[imageIndex];

            if (imageToRemove) {
                URL.revokeObjectURL(
                    imageToRemove.url
                );
            }

            return previousImages.filter(
                (_, index) =>
                    index !== imageIndex
            );
        });
    };

    return (
        <div className="chat-input-wrapper">
            {images.length > 0 && (
                <div className="chat-input-preview-list">
                    {images.map(
                        (image, index) => (
                            <div
                                key={`${image.file.name}-${index}`}
                                className="chat-input-preview-item"
                            >
                                <button
                                    type="button"
                                    className="chat-input-preview-remove"
                                    aria-label={`Remove ${image.file.name}`}
                                    onClick={() =>
                                        handleRemoveImage(
                                            index
                                        )
                                    }
                                >
                                    ×
                                </button>

                                <img
                                    className="chat-input-preview-image"
                                    src={image.url}
                                    alt={image.file.name}
                                />
                            </div>
                        )
                    )}
                </div>
            )}

            <form
                className="chat-input-container"
                onSubmit={handleSubmit}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageChange}
                />

                <button
                    type="button"
                    className="chat-input-attach-button"
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    disabled={sending}
                >
                    +
                </button>

                <textarea
                    ref={textareaRef}
                    className="chat-input"
                    placeholder="Message AI..."
                    rows={1}
                    value={prompt}
                    onChange={(event) =>
                        setPrompt(
                            event.target.value
                        )
                    }
                    onKeyDown={handleKeyDown}
                    onPaste={handlePasteImages}
                    disabled={sending}
                />

                <button
                    type={sending ? "button" : "submit"}
                    className={`chat-input-send-button ${
                        sending ? "is-sending" : ""
                    }`}
                    onClick={(e) => {
                        if (sending && onStop) {
                            e.preventDefault();
                            onStop(); // استدعاء دالة الإيقاف عند النقر
                        }
                    }}
                    disabled={
                        !sending &&
                        (!prompt.trim() &&
                            images.length === 0)
                    }
                >
                    {sending ? (
                        <span className="chat-input-stop-icon"></span>
                    ) : (
                        "↑"
                    )}
                </button>
            </form>

            {images.length > 0 && (
                <p className="chat-input-selected-images">
                    {images.length} image
                    {images.length > 1
                        ? "s"
                        : ""}{" "}
                    selected
                </p>
            )}

            <p className="chat-input-disclaimer">
                AI can make mistakes. Check
                important information.
            </p>
        </div>
    );
};

export default ChatInput;