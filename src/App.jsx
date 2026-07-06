import React, { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://keuiteylcqdixfwoilko.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Q0OBUa6MwQhYjIv2hgREw_BUAseAVd';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export default function DecisionCapture() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCapture, setShowCapture] = useState(false);
  const [text, setText] = useState('');
  const [reason, setReason] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/decisions?select=*&order=created_at.desc`,
        { headers }
      );
      if (!res.ok) throw new Error('加载失败');
      const data = await res.json();
      setDecisions(data);
      setError(null);
    } catch (e) {
      setError('无法连接数据库,请检查网络');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  const confirmDecision = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/decisions?id=eq.${editingId}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ summary: text, reason: reason }),
          }
        );
        if (!res.ok) throw new Error('更新失败');
      } else {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/decisions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ summary: text, reason: reason }),
        });
        if (!res.ok) throw new Error('保存失败');
      }
      await fetchDecisions();
      setShowCapture(false);
      setEditingId(null);
      setText('');
      setReason('');
    } catch (e) {
      setError('保存失败,请重试');
    } finally {
      setSaving(false);
    }
  };

  const deleteDecision = async (id) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/decisions?id=eq.${id}`,
        { method: 'DELETE', headers }
      );
      if (!res.ok) throw new Error('删除失败');
      setDecisions(decisions.filter((d) => d.id !== id));
    } catch (e) {
      setError('删除失败,请重试');
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', {
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#12151A',
      color: '#EDEAE3',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            fontWeight: 400,
            margin: 0,
          }}>
            决策 DNA
          </h1>
          <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '8px' }}>
            每一个决定,都是数据
          </p>
        </div>

        {error && (
          <div style={{
            background: '#2A1616',
            border: '1px solid #5A2A2A',
            color: '#E5A0A0',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        {!showCapture && (
          <button
            onClick={() => setShowCapture(true)}
            style={{
              width: '100%',
              padding: '20px',
              background: 'transparent',
              border: '1px solid #C9A961',
              borderRadius: '4px',
              color: '#C9A961',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '48px',
            }}
          >
            + 记录一个决定
          </button>
        )}

        {showCapture && (
          <div style={{
            border: '1px solid #2A2E36',
            borderRadius: '4px',
            padding: '24px',
            marginBottom: '48px',
            background: '#161A21',
          }}>
            <div style={{ color: '#6B7280', fontSize: '13px', marginBottom: '8px' }}>
              我决定了...
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入你的决定"
              autoFocus
              style={{
                width: '100%',
                minHeight: '80px',
                background: '#0E1015',
                border: '1px solid #2A2E36',
                borderRadius: '4px',
                color: '#EDEAE3',
                fontSize: '16px',
                padding: '12px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ color: '#6B7280', fontSize: '13px', marginBottom: '8px' }}>
              为什么?(可选)
            </div>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="因为..."
              style={{
                width: '100%',
                background: '#0E1015',
                border: '1px solid #2A2E36',
                borderRadius: '4px',
                color: '#EDEAE3',
                fontSize: '15px',
                padding: '12px',
                outline: 'none',
                marginBottom: '20px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={confirmDecision}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: saving ? '#8A7A50' : '#C9A961',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#12151A',
                  fontSize: '14px',
                  cursor: saving ? 'default' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {saving ? '保存中...' : '确认记录'}
              </button>
              <button
                onClick={() => {
                  setShowCapture(false);
                  setEditingId(null);
                  setText('');
                  setReason('');
                }}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: '1px solid #2A2E36',
                  borderRadius: '4px',
                  color: '#6B7280',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div>
          <div style={{
            fontSize: '12px',
            color: '#6B7280',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            决策记录 · {decisions.length}
          </div>

          {loading && (
            <div style={{ color: '#6B7280', fontSize: '14px', padding: '24px 0' }}>
              加载中...
            </div>
          )}

          {!loading && decisions.length === 0 && (
            <div style={{ color: '#3D4148', fontSize: '14px', padding: '24px 0' }}>
              还没有记录。第一条决定,现在就可以开始。
            </div>
          )}

          {decisions.map((d) => (
            <div key={d.id} style={{
              borderLeft: '2px solid #C9A961',
              paddingLeft: '16px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '6px' }}>
                  {formatTime(d.created_at)}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setEditingId(d.id);
                      setText(d.summary);
                      setReason(d.reason || '');
                      setShowCapture(true);
                    }}
                    style={{
                      background: 'none', border: 'none', color: '#6B7280',
                      fontSize: '12px', cursor: 'pointer', padding: 0,
                    }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => deleteDecision(d.id)}
                    style={{
                      background: 'none', border: 'none', color: '#6B7280',
                      fontSize: '12px', cursor: 'pointer', padding: 0,
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '15px', lineHeight: 1.5, marginBottom: '4px' }}>
                {d.summary}
              </div>
              {d.reason && (
                <div style={{ fontSize: '13px', color: '#8B8F98', fontStyle: 'italic' }}>
                  — {d.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
