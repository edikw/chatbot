'use client';
import React, { useEffect, useState, useRef } from 'react';

import { useChat } from 'ai/react';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp as faThumbsUpRegular } from "@fortawesome/free-regular-svg-icons";
import { faThumbsUp as faThumbsUpSolid } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown as faThumbsDownRegular } from '@fortawesome/free-regular-svg-icons';
import { faThumbsDown as faThumbsDownSolid } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';

function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [rating, setRating] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const modalLikeRef = useRef(null);
  const modalDisLikeRef = useRef(null);
  const modalDeleteRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMessages = localStorage.getItem('messages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setChatMessages(parsedMessages);

      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (chatMessages.length && !messages.length) {
        localStorage.setItem('messages', JSON.stringify(chatMessages));
        setChatMessages(chatMessages);
      }
      if (messages.length > 0) {
        localStorage.setItem('messages', JSON.stringify(messages));
        setChatMessages(messages);
      }
    }
  }, [messages]);

  const handleRating = () => {
    const updatedMessages = chatMessages.map(m => {
      if (m.id === selectedMessageId) {
        return {
          ...m,
          rating: rating,

          feedback: feedbackText
        };
      }
      return m;
    });

    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    setChatMessages(updatedMessages);
    if (modalLikeRef.current) {
      modalLikeRef.current.close();
    }
    if (modalDisLikeRef.current) {
      modalDisLikeRef.current.close();
    }
  };

  const handleCheckboxChange = (data) => {
    if (selectedMessages.includes(data.id)) {
      const updatedSelectedMessages = selectedMessages.filter(messageId => messageId !== data.id);
      setSelectedMessages(updatedSelectedMessages);
    } else {
      setSelectedMessages(prevSelectedMessages => prevSelectedMessages.concat(data.id));
    }
  };

  const checkedAll = () => {
    setSelectedMessages([])
    chatMessages.map(m => {
      setSelectedMessages(prevSelectedMessages => prevSelectedMessages.concat(m.id));
    })
  }

  const deleteMessage = () => {
    const updatedMessages = chatMessages.filter(m => !selectedMessages.includes(m.id));
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    setChatMessages(updatedMessages);
    setSelectedMessages([]);
    setShowCheckbox(false);
    if (modalDeleteRef.current) {
      modalDeleteRef.current.close();
    }
  }

  return (
    <div className='grid grid-cols-1'>
      <div className='p-4 shadow-md flex justify-between items-center'>
        <div className='flex items-center gap-6'>
          <FontAwesomeIcon
            icon={faArrowLeft}
            className='text-lg'

          />
          <div className='flex items-center gap-2'>
            <div className='w-10'>
              <img src="https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg" className='rounded-full' />
            </div>
            <p>Leydroid</p>
          </div>
        </div>

        {showCheckbox ? (<button className="btn" onClick={() => { setSelectedMessages([]), setShowCheckbox(false) }}>Batal</button>) : (
          <details className="dropdown dropdown-end">
            <summary tabIndex={0} className="btn">
              <FontAwesomeIcon
                icon={faEllipsisVertical}

              />
            </summary>
            <ul tabIndex={0} className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
              <li><div className='text-red-500' tabIndex={0} role="button" onClick={() => {
                setShowCheckbox(true)
              }}><FontAwesomeIcon icon={faTrashCan} /> Hapus Chat</div></li>
            </ul>
          </details>

        )}
      </div>
      <div className="min-h-screen">
        <div className='px-4'>
          {chatMessages.map(m => (
            <div key={m.id} className={` p-4 rounded-lg mb-3  ${m.role === 'user' ? 'chat chat-end flex justify-end' : 'chat chat-start'}`}
              style={{ alignItems: 'end' }}
            >
              {m.role !== 'user' ? (
                <div className='flex gap-1'>
                  {showCheckbox && (<input type="checkbox" className="checkbox"
                    checked={selectedMessages.includes(m.id)}
                    onChange={() => handleCheckboxChange(m)} />)}

                  <div className="chat-image avatar">
                    <div className="w-8 rounded-full">
                      <img src="https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg" />
                    </div>
                  </div>
                </div>
              ) : ''}
              <div className={`chat-bubble ${m.role === 'user' ? 'bg-gray-200' : 'bg-[#2c2e63]'}`}>
                <p className={`break-words ${m.role === 'user' ? 'text-black' : ''} `}>
                  {m.content}
                  <span className='text-xs ml-2 text-gray-500'>
                    {moment(m.createdAt).format('HH:mm')}
                  </span>
                </p>
                {m.role !== 'user' ? (
                  <div className='flex gap-4 items-center justify-end p-4'>
                    <button onClick={() => {
                      setFeedbackText('');
                      setSelectedMessageId(m.id);
                      setRating('like');
                      document.getElementById('modalLike').showModal()
                    }}>
                      <FontAwesomeIcon
                        icon={m.rating && m.rating === 'like' ? faThumbsUpSolid : faThumbsUpRegular}

                      />
                    </button>
                    <button onClick={() => {
                      setFeedbackText('');
                      setSelectedMessageId(m.id);
                      setRating('dislike');
                      document.getElementById('modalDislike').showModal()
                    }} >
                      <FontAwesomeIcon
                        icon={m.rating && m.rating === 'dislike' ? faThumbsDownSolid : faThumbsDownRegular}
                      />

                    </button>
                  </div>
                ) : ''}

              </div>
              {showCheckbox && m.role === 'user' && (
                <input type="checkbox" className="checkbox" checked={selectedMessages.includes(m.id)}
                  onChange={() => handleCheckboxChange(m)} />
              )}
            </div>
          ))}
        </div>
        <div className='h-40'>
        </div>

        {showCheckbox ? (
          <div className="fixed bottom-0 p-5 w-full bg-white shadow-md border">
            <div className='flex justify-between items-center'>
              <p className='text-gray-600'>{selectedMessages.length} Terpilih | <span onClick={() => checkedAll()}>Pilih Semua</span></p>
              <button disabled={!selectedMessages.length} className='text-red-500' onClick={() => document.getElementById('modalDelete').showModal()}><FontAwesomeIcon icon={faTrashCan} /> Hapus</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='w-full fixed bottom-0 p-4'>
            <input
              className="input input-bordered w-full"
              value={input}
              placeholder="Send Message..."
              onChange={handleInputChange}
            />
          </form>
        )}
      </div>

      {/* MODAL LIKE */}
      <dialog ref={modalLikeRef} id="modalLike" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <h3 className="font-bold">Rating</h3>
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-1">✕</button>
          </form>
          <div className='text-center mb-4 mt-10'>
            <FontAwesomeIcon icon={faThumbsUpRegular} className='text-2xl mb-1' />
            <div className="mb-2">
              <p className='font-bold'>Kamu menyukai balasan AI</p>
              <p className='text-gray-500'>Ceritakan pengalaman tentang balasan chat ini</p>
            </div>
            <div className="w-full">
              <textarea className="textarea textarea-bordered w-full" placeholder="Berikan tanggapanmu" value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}></textarea>
            </div>
          </div>

          <div className='w-full'>
            <button className='btn btn-circle btn-neutral	w-full' onClick={handleRating}>Kirim</button>
          </div>
        </div>
      </dialog>
      {/* END MODAL LIKE */}

      {/* MODAL DISLIKE */}
      <dialog ref={modalDisLikeRef} id="modalDislike" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <h3 className="font-bold">Rating</h3>
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-1">✕</button>
          </form>
          <div className='text-center mb-4 mt-10'>
            <FontAwesomeIcon icon={faThumbsDownRegular} className='text-2xl mb-1' />
            <div className="mb-2">
              <p className='font-bold'>Kamu tidak menyukai balasan AI</p>
              <p className='text-gray-500'>Ceritakan pengalaman tentang balasan chat ini</p>
            </div>
            <div className="w-full">
              <textarea className="textarea textarea-bordered w-full" placeholder="Berikan tanggapanmu" value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}></textarea>
            </div>
          </div>

          <div className='w-full'>
            <button className='btn btn-circle btn-neutral	w-full' onClick={handleRating}>Kirim</button>
          </div>
        </div>
      </dialog>
      {/* END MODAL DISLIKE */}

      {/* MODAL DELETE */}
      <dialog ref={modalDeleteRef} id="modalDelete" className="modal">
        <div className="modal-box">
          <h3 className="font-bold">Hapus Chat</h3>

          <div className='mb-8 mt-10'>
            <p>Kamu akan menghapus chat ini, chat yang telah dihapus tidak dapat di pulihkan</p>
          </div>
          <div className='w-full mb-4'>
            <button className='btn btn-circle btn-error	w-full text-white' onClick={deleteMessage}>Hapus Sekarang</button>
          </div>
          <form method="dialog">
            <button className="w-full text-center btn-ghost">Kembali</button>
          </form>
        </div>
      </dialog>
      {/* END MODAL DISLIKE */}
    </div >
  );
}

export default Chat;
