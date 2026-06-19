import { Button, Space } from 'antd';
import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const commands = [
  { command: 'bold', label: '加粗' },
  { command: 'insertUnorderedList', label: '列表' },
  { command: 'insertOrderedList', label: '编号' },
  { command: 'formatBlock', label: '小标题', value: 'h3' },
] as const;

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== (value ?? '')) {
      editor.innerHTML = value ?? '';
    }
  }, [value]);

  const emitChange = () => {
    onChange?.(editorRef.current?.innerHTML ?? '');
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  return (
    <div className="rich-editor">
      <Space className="rich-editor-toolbar" wrap>
        {commands.map((item) => (
          <Button
            key={item.command + '-' + item.label}
            size="small"
            type="text"
            onClick={() => runCommand(item.command, 'value' in item ? item.value : undefined)}
          >
            {item.label}
          </Button>
        ))}
      </Space>
      <div
        ref={editorRef}
        className="rich-editor-body"
        contentEditable
        role="textbox"
        aria-label="菜谱内容"
        data-placeholder="可以直接写：食材、做法、备注、小贴士……"
        onInput={emitChange}
        onBlur={emitChange}
      />
    </div>
  );
}
