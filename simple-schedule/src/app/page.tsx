'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

type Slot = {
  id: string
  providerName: string
  date: string
  time: string
  maxAttendees: number
  attendees: { id: string; name: string }[]
  providerId: string
  zoomUrl?: string
}

export default function Home() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [myId, setMyId] = useState<string>('')
  const [providerName, setProviderName] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [maxAttendees, setMaxAttendees] = useState(1)
  const [zoomUrl, setZoomUrl] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [attendeeName, setAttendeeName] = useState('')
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)
  const [newZoomUrl, setNewZoomUrl] = useState('')

  useEffect(() => {
    // ローカルストレージから自分のIDを取得または生成
    let id = localStorage.getItem('myId')
    if (!id) {
      id = uuidv4()
      localStorage.setItem('myId', id)
    }
    setMyId(id)

    // ローカルストレージからスロットデータを取得
    const savedSlots = localStorage.getItem('slots')
    if (savedSlots) {
      try {
        const parsed = JSON.parse(savedSlots)
        // データ形式の移行（古いデータとの互換性）
        const migratedSlots = parsed.map((slot: any) => ({
          ...slot,
          attendees: slot.attendees || [],
          maxAttendees: slot.maxAttendees || 1,
          zoomUrl: slot.zoomUrl || '',
        }))
        setSlots(migratedSlots)
      } catch (error) {
        console.error('Failed to parse slots:', error)
        localStorage.removeItem('slots')
      }
    }
  }, [])

  useEffect(() => {
    // スロットデータをローカルストレージに保存
    if (slots.length > 0) {
      localStorage.setItem('slots', JSON.stringify(slots))
    }
  }, [slots])

  // レッスン枠を追加
  const handleAddSlot = () => {
    if (!providerName || !selectedDate || !selectedTime) {
      alert('すべての項目を入力してください')
      return
    }

    const newSlot: Slot = {
      id: uuidv4(),
      providerName,
      date: selectedDate,
      time: selectedTime,
      maxAttendees,
      attendees: [],
      providerId: myId,
      zoomUrl: zoomUrl || undefined,
    }

    setSlots([...slots, newSlot])
    setProviderName('')
    setSelectedDate('')
    setSelectedTime('')
    setMaxAttendees(1)
    setZoomUrl('')
  }

  // 予約する
  const handleBookSlot = () => {
    if (!selectedSlot || !attendeeName) return

    const updatedSlots = slots.map(slot => {
      if (slot.id === selectedSlot.id) {
        return {
          ...slot,
          attendees: [...slot.attendees, { id: myId, name: attendeeName }],
        }
      }
      return slot
    })

    setSlots(updatedSlots)
    setSelectedSlot(null)
    setAttendeeName('')
  }

  // ZOOM URLを更新
  const handleUpdateZoomUrl = (slotId: string, url: string) => {
    const updatedSlots = slots.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          zoomUrl: url || undefined,
        }
      }
      return slot
    })
    setSlots(updatedSlots)
    setEditingSlot(null)
    setNewZoomUrl('')
  }

  // キャンセル（レッスン側・受講側）
  const handleCancel = (slotId: string, attendeeId?: string) => {
    const slot = slots.find(s => s.id === slotId)
    if (!slot) return

    if (slot.providerId === myId && !attendeeId) {
      // レッスン側のキャンセル（枠を削除）
      setSlots(slots.filter(s => s.id !== slotId))
    } else if (attendeeId) {
      // 受講側のキャンセル（予約を解除）
      const updatedSlots = slots.map(s => {
        if (s.id === slotId) {
          return {
            ...s,
            attendees: s.attendees.filter(a => a.id !== attendeeId),
          }
        }
        return s
      })
      setSlots(updatedSlots)
    }
  }

  // 日付でグループ化
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = slot.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(slot)
    return acc
  }, {} as Record<string, Slot[]>)

  // 日付をソート
  const sortedDates = Object.keys(groupedSlots).sort()

  // 時間オプション（00分と30分のみ）
  const timeOptions = []
  for (let hour = 6; hour <= 23; hour++) {
    timeOptions.push(`${hour.toString().padStart(2, '0')}:00`)
    timeOptions.push(`${hour.toString().padStart(2, '0')}:30`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ロゴとタイトル */}
        <div className="flex flex-col items-center mb-8">
          {typeof window !== 'undefined' && (
            <img
              src="/logo.webp"
              alt="Logo"
              className="h-20 w-auto mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            レッスン練習 スケジュール調整
          </h1>
        </div>

        {/* データリセットボタン（開発用） */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <div className="text-center mb-4">
            <button
              onClick={() => {
                if (confirm('すべてのデータをリセットしますか？')) {
                  localStorage.clear()
                  window.location.reload()
                }
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              データリセット（開発用）
            </button>
          </div>
        )}

        {/* レッスン枠追加フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-indigo-900">📝 レッスン枠を追加</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">レッスン生</label>
              <input
                type="text"
                placeholder="名前"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">選択</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">募集人数</label>
              <select
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}人</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ZOOM URL（任意）</label>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                value={zoomUrl}
                onChange={(e) => setZoomUrl(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">※後からでも追加・編集できます</p>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddSlot}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition font-medium shadow-lg"
              >
                追加する
              </button>
            </div>
          </div>
        </div>

        {/* カレンダー形式の表示 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-indigo-900">📅 スケジュール一覧</h2>

          {sortedDates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだレッスン枠がありません</p>
          ) : (
            <div className="space-y-8">
              {sortedDates.map(date => (
                <div key={date} className="border-b border-gray-200 pb-6">
                  <h3 className="font-bold text-xl mb-4 text-indigo-800 flex items-center">
                    📆 {format(parseISO(date), 'MM月dd日')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedSlots[date]
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(slot => {
                        const attendees = slot.attendees || []
                        const maxAttendees = slot.maxAttendees || 1
                        const isFull = attendees.length >= maxAttendees
                        const isMyLesson = slot.providerId === myId
                        const isMyBooking = attendees.some(a => a.id === myId)

                        return (
                          <div
                            key={slot.id}
                            className={`relative rounded-xl p-5 transition-all ${
                              isFull
                                ? 'bg-gray-50 border-2 border-gray-300'
                                : 'bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-300 hover:shadow-2xl cursor-pointer hover:scale-105'
                            }`}
                            onClick={() => !isFull && attendees.length < maxAttendees && setSelectedSlot(slot)}
                          >
                            {/* 時間とレッスン生 */}
                            <div className="mb-3">
                              <p className="text-2xl font-bold text-indigo-900">{slot.time}</p>
                              <p className="text-lg font-semibold text-gray-800 mt-1">
                                👩‍🏫 {slot.providerName}
                              </p>

                              {/* ZOOM URL */}
                              {editingSlot?.id === slot.id && isMyLesson ? (
                                <div className="mt-2 space-y-2">
                                  <input
                                    type="url"
                                    placeholder="ZOOM URLを入力"
                                    value={newZoomUrl}
                                    onChange={(e) => setNewZoomUrl(e.target.value)}
                                    className="w-full px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleUpdateZoomUrl(slot.id, newZoomUrl)
                                      }}
                                      className="text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600"
                                    >
                                      保存
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingSlot(null)
                                        setNewZoomUrl('')
                                      }}
                                      className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                                    >
                                      キャンセル
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {slot.zoomUrl ? (
                                    <div className="mt-2 flex items-center gap-2">
                                      <a
                                        href={slot.zoomUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                      >
                                        🎥 ZOOMに参加
                                      </a>
                                      {isMyLesson && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingSlot(slot)
                                            setNewZoomUrl(slot.zoomUrl || '')
                                          }}
                                          className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                          編集
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    isMyLesson && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setEditingSlot(slot)
                                          setNewZoomUrl('')
                                        }}
                                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
                                      >
                                        + ZOOM URLを追加
                                      </button>
                                    )
                                  )}
                                </>
                              )}
                            </div>

                            {/* 募集状況 */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">参加者</span>
                                <span className={`text-sm font-bold ${
                                  isFull ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {attendees.length}/{maxAttendees}人
                                </span>
                              </div>

                              {/* 参加者リスト */}
                              {attendees.length > 0 && (
                                <div className="space-y-1">
                                  {attendees.map(attendee => (
                                    <div key={attendee.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                                      <span className="text-sm text-gray-700">👤 {attendee.name}</span>
                                      {attendee.id === myId && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleCancel(slot.id, attendee.id)
                                          }}
                                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        >
                                          取消
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* 操作ボタン */}
                            {isMyLesson && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancel(slot.id)
                                }}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-medium text-sm"
                              >
                                枠削除
                              </button>
                            )}

                            {/* 状態表示 */}
                            {!isFull && !isMyBooking && (
                              <div className="text-center mt-3 py-2 bg-indigo-100 rounded-lg">
                                <p className="text-sm font-medium text-indigo-700">
                                  クリックして予約
                                </p>
                              </div>
                            )}

                            {isFull && (
                              <div className="text-center mt-3 py-2 bg-gray-100 rounded-lg">
                                <p className="text-sm font-medium text-gray-500">
                                  満席
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 宣伝セクション */}
      <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🎯 AIでWebサイト制作を学ぼう！</h3>
            <p className="text-base text-gray-700">
              こういうサイトが簡単に作れるようになるAIセミナーやってます。（※製作時間30分）<br />
              まずは無料体験セミナーに是非！
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center items-center gap-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  📅 10/14(火) 21:00～
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ✨ 参加無料
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                  💻 ZOOM開催
                </span>
              </div>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScpD-uXPZ6FbkH3zcUSZFB1ZVuWXY0sTD4v8L5k_kjLL0dasQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md"
              >
                🚀 無料体験セミナーに申し込む
              </a>
            </div>
          </div>

          {/* サムネイル画像 */}
          {typeof window !== 'undefined' && (
            <div className="flex justify-center">
              <img
                src="/ai-seminar-thumbnail.png"
                alt="AIセミナー"
                className="w-80 rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 予約モーダル */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-indigo-900">🎓 レッスン予約</h3>

            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">日時</p>
                <p className="font-bold text-lg">
                  {format(parseISO(selectedSlot.date), 'MM月dd日')} {selectedSlot.time}
                </p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">レッスン生</p>
                <p className="font-bold text-lg">{selectedSlot.providerName}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">現在の参加者</p>
                <p className="font-bold text-lg text-green-600">
                  {(selectedSlot.attendees || []).length}/{selectedSlot.maxAttendees || 1}人
                </p>
              </div>
              {selectedSlot.zoomUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">ZOOM URL</p>
                  <a
                    href={selectedSlot.zoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    🎥 ZOOMに参加
                  </a>
                </div>
              )}
            </div>

            {(selectedSlot.attendees || []).length >= (selectedSlot.maxAttendees || 1) ? (
              <div className="text-center py-4">
                <p className="text-red-600 font-bold">この枠は満席です</p>
                <button
                  onClick={() => {
                    setSelectedSlot(null)
                    setAttendeeName('')
                  }}
                  className="mt-4 w-full bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  閉じる
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    あなたの名前
                  </label>
                  <input
                    type="text"
                    placeholder="名前を入力"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBookSlot}
                    disabled={!attendeeName}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    予約確定
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSlot(null)
                      setAttendeeName('')
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    キャンセル
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
