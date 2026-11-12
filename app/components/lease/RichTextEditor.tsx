import { BoldOutlined, ItalicOutlined, OrderedListOutlined, UnderlineOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import { useEffect, useRef } from "react";

const allowedTags = new Set([
    "P",
    "DIV",
    "BR",
    "STRONG",
    "B",
    "EM",
    "I",
    "U",
    "UL",
    "OL",
    "LI",
    "BLOCKQUOTE",
]);

const escapeText = (value: string) =>
    value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export const sanitizeRichText = (html: string): string => {
    const document = new DOMParser().parseFromString(html, "text/html");
    const serialize = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return escapeText(node.textContent ?? "");
        }

        if (!(node instanceof Element)) {
            return "";
        }

        if (node.tagName === "SCRIPT" || node.tagName === "STYLE") {
            return "";
        }

        const content = Array.from(node.childNodes, serialize).join("");
        const tagName = node.tagName === "DIV" ? "p" : node.tagName.toLowerCase();
        return allowedTags.has(node.tagName)
            ? `<${tagName}${node.tagName === "BR" ? " /" : ""}>${node.tagName === "BR" ? "" : content}${node.tagName === "BR" ? "" : `</${tagName}>`}`
            : content;
    };

    return Array.from(document.body.childNodes, serialize).join("");
};

interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
}

export default function RichTextEditor({ value = "", onChange }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const sanitizedValue = sanitizeRichText(value);
        if (sanitizeRichText(editor.innerHTML) !== sanitizedValue) {
            editor.innerHTML = sanitizedValue;
        }
    }, [value]);

    const format = (command: string) => {
        editorRef.current?.focus();
        document.execCommand(command);
        if (editorRef.current) {
            onChange?.(sanitizeRichText(editorRef.current.innerHTML));
        }
    };

    return (
        <div>
            <Flex gap="small" wrap="wrap" style={{ marginBottom: 8 }}>
                <Button aria-label="Bold" icon={<BoldOutlined />} onMouseDown={(event) => event.preventDefault()} onClick={() => format("bold")} />
                <Button aria-label="Italic" icon={<ItalicOutlined />} onMouseDown={(event) => event.preventDefault()} onClick={() => format("italic")} />
                <Button aria-label="Underline" icon={<UnderlineOutlined />} onMouseDown={(event) => event.preventDefault()} onClick={() => format("underline")} />
                <Button aria-label="Bulleted list" icon={<UnorderedListOutlined />} onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertUnorderedList")} />
                <Button aria-label="Numbered list" icon={<OrderedListOutlined />} onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertOrderedList")} />
            </Flex>
            <div
                ref={editorRef}
                contentEditable
                role="textbox"
                aria-label="Lease terms and conditions"
                aria-multiline="true"
                onInput={(event) => onChange?.(sanitizeRichText(event.currentTarget.innerHTML))}
                style={{
                    minHeight: 180,
                    maxHeight: 360,
                    overflowY: "auto",
                    padding: 12,
                    border: "1px solid #d9d9d9",
                    borderRadius: 6,
                    outlineColor: "#1677ff",
                }}
            />
        </div>
    );
}
