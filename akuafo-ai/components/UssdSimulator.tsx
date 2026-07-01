'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UssdSimulator() {
  // USSD Simulator State
  const [ussdSessionId, setUssdSessionId] = useState<string>('');
  const [ussdPhoneNumber, setUssdPhoneNumber] = useState<string>('0244123456');
  const [ussdInputText, setUssdInputText] = useState<string>('');
  const [ussdScreenText, setUssdScreenText] = useState<string>('Phone Off. Press Dial below to initiate USSD.');
  const [ussdHistory, setUssdHistory] = useState<string[]>([]);
  const [ussdSessionActive, setUssdSessionActive] = useState<boolean>(false);
  const [smsInbox, setSmsInbox] = useState<string[]>([]);
  const [customInputValue, setCustomInputValue] = useState<string>('');

  // Trigger USSD Simulator Calls
  const handleUSSDDial = () => {
    const newSessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
    setUssdSessionId(newSessionId);
    setUssdInputText('');
    setUssdSessionActive(true);
    setUssdHistory([]);
    setCustomInputValue('');

    // Fetch initial USSD Screen
    fetchUSSDResponse(newSessionId, ussdPhoneNumber, '');
  };

  const handleUSSDSubmitInput = (input: string) => {
    if (!ussdSessionActive) return;
    const newText = ussdInputText ? `${ussdInputText}*${input}` : input;
    setUssdInputText(newText);
    setUssdHistory((prev) => [...prev, `User: ${input}`]);
    setCustomInputValue('');

    fetchUSSDResponse(ussdSessionId, ussdPhoneNumber, newText);
  };

  const fetchUSSDResponse = async (sessId: string, phone: string, textPayload: string) => {
    try {
      const res = await fetch(`/api/ussd?sessionId=${sessId}&phoneNumber=${phone}&text=${encodeURIComponent(textPayload)}`);
      const data = await res.json();
      
      let cleanText = data.response;
      if (cleanText.startsWith('CON ')) {
        cleanText = cleanText.substring(4);
      } else if (cleanText.startsWith('END ')) {
        cleanText = cleanText.substring(4);
        setUssdSessionActive(false);
        // Simulate sending SMS follow-up upon session end
        triggerSmsReceipt(cleanText);
      }

      setUssdScreenText(cleanText);
    } catch (err) {
      setUssdScreenText('Network Error. Please try again.');
    }
  };

  const triggerSmsReceipt = (sessionResult: string) => {
    let message = `[Akuafo AI Advisor] Dear Farmer, here is your requested advisory:\n`;
    if (sessionResult.includes('Planting')) {
      message += `Optimal window checks: ${sessionResult}.`;
    } else if (sessionResult.includes('Harvest')) {
      message += `Harvest warning: ${sessionResult}.`;
    } else if (sessionResult.includes('Top recommendations')) {
      message += `Region suitability: ${sessionResult}.`;
    } else {
      message += `Regional alert details: ${sessionResult}. For full updates dial *902# again. Free MoFA service.`;
    }

    setSmsInbox((prev) => [message, ...prev]);
  };

  const resetUSSDPhone = () => {
    setUssdSessionActive(false);
    setUssdScreenText('Phone Off. Press Dial below to initiate USSD.');
    setUssdInputText('');
    setUssdSessionId('');
    setUssdHistory([]);
  };

  const clearSMSInbox = () => {
    setSmsInbox([]);
  };

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto w-full">
      {/* Phone Frame container */}
      <div className="glass-panel rounded-3xl p-5 border border-zinc-300 relative bg-zinc-900 text-white overflow-hidden shadow-2xl">
        
        {/* Phone Speaker & Camera notches */}
        <div className="flex justify-center items-center gap-1.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          <div className="w-16 h-1 bg-zinc-700 rounded-full" />
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold px-2 mb-2">
          <span>MTN-GH 5G</span>
          <span>12:00 PM</span>
        </div>

        {/* USSD Dialog Screen Display */}
        <div className="w-full bg-zinc-800 rounded-2xl border border-zinc-700 p-4 h-48 flex flex-col justify-between mb-4 text-xs font-mono select-none overflow-y-auto">
          <div className="whitespace-pre-wrap leading-relaxed text-zinc-200">
            {ussdScreenText}
          </div>
          {ussdSessionActive && (
            <div className="text-[9px] text-zinc-500 border-t border-zinc-700/60 pt-2 flex justify-between items-center">
              <span>Session Active</span>
              <span>Dial *902#</span>
            </div>
          )}
        </div>

        {/* Standard Keypad utilizing shadcn Button variants */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold select-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((btn) => (
            <Button
              key={btn}
              variant="ghost"
              onClick={() => {
                if (ussdSessionActive) {
                  if (btn === '*') return;
                  if (btn === '#') return;
                  handleUSSDSubmitInput(String(btn));
                }
              }}
              disabled={!ussdSessionActive && btn !== '*' && btn !== 0 && btn !== '#'}
              className={`py-5 rounded-xl border border-zinc-700 transition-all text-white font-bold h-auto ${
                ussdSessionActive 
                  ? 'bg-zinc-800 hover:bg-zinc-700 hover:text-white cursor-pointer active:scale-95' 
                  : 'bg-zinc-900/60 text-zinc-650 border-zinc-800 cursor-not-allowed'
              }`}
            >
              {btn}
            </Button>
          ))}
        </div>

        {/* Dialer buttons using shadcn Button */}
        <div className="flex gap-2.5 mt-4">
          {ussdSessionActive ? (
            <Button 
              onClick={resetUSSDPhone} 
              variant="destructive"
              className="flex-1 font-extrabold text-xs py-4 h-auto rounded-xl cursor-pointer hover:bg-red-800 active:scale-95 text-white bg-red-700 border-none"
            >
              Cancel
            </Button>
          ) : (
            <Button 
              onClick={handleUSSDDial} 
              className="flex-1 font-extrabold text-xs py-4 h-auto rounded-xl cursor-pointer bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white border-none glow-green"
            >
              Dial *902#
            </Button>
          )}
        </div>

        {/* In-phone input helper for numbers */}
        {ussdSessionActive && (
          <div className="mt-4 border-t border-zinc-850 pt-3">
            <label className="text-[9px] text-zinc-400 block mb-1.5 font-bold uppercase">Enter Selection (Send):</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="e.g. 1"
                className="flex-1 bg-zinc-800 border border-zinc-700 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none text-white font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInputValue) {
                    handleUSSDSubmitInput(customInputValue);
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (customInputValue) {
                    handleUSSDSubmitInput(customInputValue);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1.5 px-3 h-8 rounded-lg cursor-pointer text-white border-none"
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* SMS Inbox with shadcn Card components */}
      <Card className="glass-panel bg-transparent ring-0 border-none rounded-3xl overflow-hidden">
        <CardHeader className="pb-2 px-5 pt-5 flex flex-row justify-between items-center space-y-0">
          <CardTitle className="text-xs font-black text-gray-500 uppercase tracking-wider">Farmer's SMS Inbox</CardTitle>
          {smsInbox.length > 0 && (
            <Button 
              onClick={clearSMSInbox} 
              variant="link" 
              className="text-[10px] text-red-500 h-6 px-1 hover:no-underline hover:text-red-700"
            >
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-1">
          {smsInbox.length === 0 ? (
            <div className="text-center py-6 text-zinc-400 dark:text-zinc-600 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold">
              No messages. Dial *902# to receive alerts.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {smsInbox.map((msg, idx) => (
                <div key={idx} className="p-3 bg-agri-green-50 dark:bg-zinc-900 border border-agri-green-100 dark:border-agri-green-700/20 rounded-2xl text-xs animate-fade-in">
                  <div className="flex justify-between text-[9px] text-gray-400 font-semibold mb-1">
                    <span>Sender: 902-AKUAFO</span>
                    <span>Just now</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-normal font-medium">{msg}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
