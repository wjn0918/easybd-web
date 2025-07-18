import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function TxtTools() {
  const [text, setText] = useState("")

  const toUpper = () => setText(text.toUpperCase())
  const toLower = () => setText(text.toLowerCase())
  const trimSpaces = () => setText(text.replace(/\s+/g, " ").trim())

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text)
    toast("✅ 已复制到剪贴板")
  }

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">文本转换工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 输入框 */}
          <Textarea
            placeholder="在这里输入文本..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px]"
          />

          {/* 功能按钮 */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="default" onClick={toUpper}>转大写</Button>
            <Button variant="secondary" onClick={toLower}>转小写</Button>
            <Button variant="outline" onClick={trimSpaces}>去多余空格</Button>
            <Button variant="destructive" onClick={() => setText("")}>清空</Button>
            <Button variant="default" onClick={copyToClipboard}>复制结果</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
