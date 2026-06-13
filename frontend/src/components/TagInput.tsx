import { useState } from 'react'

type TagInputProps = {
    value: string[]
    onChange: (nextTags: string[]) => void
}

export function TagInput({ value, onChange }: TagInputProps) {
    const [inputValue, setInputValue] = useState('')

    function addTag(rawValue: string) {
        const nextTag = rawValue.trim()

        if (!nextTag) {
            return
        }

        if (value.includes(nextTag)) {
            setInputValue('')
            return
        }

        onChange([...value, nextTag])
        setInputValue('')
    }

    function removeTag(tagToRemove: string) {
        onChange(value.filter((tag) => tag !== tagToRemove))
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === ',' || event.key === 'Enter') {
            event.preventDefault()
            addTag(inputValue)
        }

        if (event.key === 'Backspace' && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1))
        }
    }

    return (
        <div className="tag-input-box">
            {value.map((tag) =>  (
                <button
                    key={tag}
                    type="button"
                    className="tag-chip"
                    onClick={() => removeTag(tag)}
                >
                    {tag} x
                </button>
            ))}
            
            <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => addTag(inputValue)}
                placeholder="Type tag and press comma"
            />
        </div>
    )
}