'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation'

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
import Image from 'next/image';

function Chat() {

  type Message = {
    id: string;
    role: 'user' | 'ai';
    content: string;
    createdAt: Date;
    rating?: 'like' | 'dislike' | undefined;
    feedback?: string;
  };
  type ChatRequestOptions = {
    option1?: string;
    option2?: number;
  };
  type UseChatHelpers = {
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement> | null, chatRequestOptions?: ChatRequestOptions | undefined) => void;
    error: Error | null;
  };

  const { messages, input, handleInputChange, handleSubmit, error } = useChat() as UseChatHelpers
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [rating, setRating] = useState<string | null>(null);;
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const modalLikeRef = useRef<HTMLDialogElement>(null);
  const modalDisLikeRef = useRef<HTMLDialogElement>(null);
  const modalDeleteRef = useRef<HTMLDialogElement>(null);
  const router = useRouter()

  // Load the chat messages from the local storage
  useEffect(() => {
    // Load the chat messages from the local storage
    if (typeof window !== 'undefined') {
      // Get the stored messages from the local storage
      const storedMessages = localStorage.getItem('messages');
      // Parse the stored messages
      if (storedMessages) {
        const parsedMessages: Message[] = JSON.parse(storedMessages);
        // Update the state of chat messages
        setChatMessages(parsedMessages);

      }
      // If there are new messages, save them to the local storage
      if (messages.length > 0) {
        localStorage.setItem('messages', JSON.stringify(messages));
        setChatMessages(messages);
      }
    }
  }, [messages]);

  // Handle the rating of the selected message
  const handleRating = () => {
    // Update the rating and feedback of the selected message
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

    // Save the updated messages to the local storage
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    // Update the state of chat messages
    setChatMessages(updatedMessages as Message[]);
    // Close the modal
    if (modalLikeRef.current) {
      modalLikeRef.current.close();
    }
    if (modalDisLikeRef.current) {
      modalDisLikeRef.current.close();
    }
  };

  // Handle the change of the checkbox
  const handleCheckboxChange = (data: { id: string }) => {
    // Check if the selected messages include the message id
    if (selectedMessages.includes(data.id)) {
      // Remove the message id from the selected messages
      const updatedSelectedMessages = selectedMessages.filter(messageId => messageId !== data.id);
      // Update the selected messages
      setSelectedMessages(updatedSelectedMessages);
    } else {
      // Add the message id to the selected messages
      setSelectedMessages(prevSelectedMessages => prevSelectedMessages.concat(data.id));
    }
  };

  // Handle the check all checkbox
  const checkedAll = () => {
    // Reset the selected messages
    setSelectedMessages([])
    // Add all the message ids to the selected messages
    chatMessages.forEach(m => {
      setSelectedMessages(prevSelectedMessages => [...prevSelectedMessages, m.id]);
    })
  }

  // Handle the delete message
  const deleteMessage = () => {
    // Filter the chat messages to remove the selected messages
    const updatedMessages = chatMessages.filter(m => !selectedMessages.includes(m.id));
    // Save the updated messages to the local storage
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    // Update the state of chat messages
    setChatMessages(updatedMessages);
    // Reset the selected messages
    setSelectedMessages([]);
    // Hide the checkbox
    setShowCheckbox(false);
    // Close the modal
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
            onClick={() => router.back()}

          />
          <div className='flex items-center gap-2'>
            <div className='w-10'>
              <Image src="/avatar.jpg" className='rounded-full' width={500}
                height={500} alt="" />
            </div>
            <p>Leydroid</p>
          </div>
        </div>



        {/* Show the delete button if the checkbox is shown, otherwise show the dropdown menu */}
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

          {/* Show the error message if there is an error */}
          {error && (
            <div className="p-4 text-center break-words">
              {error.name}
              {error.message}
            </div>
          )}

          {/* Show the chat messages */}
          {!error && chatMessages.map(m => (
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
                      <Image alt="" src="/avatar.jpg" width={500}
                        height={500} />
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
                      const modalLike = document.getElementById('modalLike') as HTMLDialogElement;
                      if (modalLike) {
                        modalLike.showModal();
                      }
                    }}>
                      <FontAwesomeIcon
                        icon={m.rating && m.rating === 'like' ? faThumbsUpSolid : faThumbsUpRegular}
                      />
                    </button>
                    <button onClick={() => {
                      setFeedbackText('');
                      setSelectedMessageId(m.id);
                      setRating('dislike');
                      const modalDislike = document.getElementById('modalDislike') as HTMLDialogElement | null;
                      if (modalDislike) {
                        modalDislike.showModal();
                      }
                    }}>
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
              <button disabled={!selectedMessages.length} className='text-red-500' onClick={() => {
                const modalDelete = document.getElementById('modalDelete') as HTMLDialogElement;
                if (modalDelete) {
                  modalDelete.showModal();
                }
              }}><FontAwesomeIcon icon={faTrashCan} /> Hapus</button>
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
