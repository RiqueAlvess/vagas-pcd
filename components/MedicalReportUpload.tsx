'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export default function MedicalReportUpload() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setError(null)
    setSelectedFile(null)

    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são aceitos.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError('O arquivo deve ter no máximo 5 MB.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setSelectedFile(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedFile) return

    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/candidates/medical', {
        method: 'POST',
        body: formData,
      })

      const body = (await res.json()) as { success?: boolean; error?: string }

      if (!res.ok || !body.success) {
        setError(body.error ?? 'Erro ao enviar o laudo. Tente novamente.')
        return
      }

      router.refresh()
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="laudo-file">Arquivo PDF do laudo médico</Label>
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            id="laudo-file"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="flex-1 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Somente PDF · máximo 5 MB
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={!selectedFile || loading}
        className="gap-2"
      >
        <Upload className="size-4" />
        {loading ? 'Enviando…' : 'Enviar laudo'}
      </Button>
    </form>
  )
}
