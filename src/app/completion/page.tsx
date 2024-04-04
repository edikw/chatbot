'use client';

import { useCompletion } from 'ai/react';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation'

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


export default function Chat() {
  const { completion, input, handleInputChange, handleSubmit, error } =
    useCompletion();
  const [chatMessages, setChatMessages] = useState<{ input: string; completion: string; rating: null; createdAtInput: Date; createdAtCompletion: Date }[]>([]);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [rating, setRating] = useState<string | null>(null);;
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const modalLikeRef = useRef<HTMLDialogElement>(null);
  const modalDisLikeRef = useRef<HTMLDialogElement>(null);
  const modalDeleteRef = useRef<HTMLDialogElement>(null);
  const router = useRouter()

  // Update the completion message with the rating and createdCompletion date
  useEffect(() => {
    // Check if completion is not null
    if (completion) {
      // Update the last message with the completion
      setChatMessages(prevMessages => {
        // Get the last message index
        const lastMessageIndex = prevMessages.length - 1;
        // Check if the last message index is greater than or equal to 0
        if (lastMessageIndex >= 0) {
          prevMessages[lastMessageIndex].completion = completion;
          prevMessages[lastMessageIndex].createdAtCompletion = new Date();
        }
        return [...prevMessages];
      });
    }
  }, [completion]);

  // Load the chat messages from the local storage
  useEffect(() => {
    // Check if window is not undefined
    if (typeof window !== 'undefined') {
      // Get the saved chat messages from the local storage
      const savedChatMessages = localStorage.getItem('chatMessages');
      if (savedChatMessages) {
        // Set the chat messages state with the saved chat messages
        setChatMessages(JSON.parse(savedChatMessages));
      }
    }
  }, []);

  // Save the chat messages to the local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Save the chat messages to the local storage
      if (chatMessages.length > 0) {
        localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
      }
    }
  }, [chatMessages]);

  // Handle the form submit event
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check if the input is empty
    const newMessage = { input, completion: '', createdAtInput: new Date(), createdAtCompletion: new Date(), rating: null };
    // Add the new message to the chat messages
    setChatMessages(prevMessages => [...prevMessages, newMessage]);
    // Reset the input value
    handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    // Handle the form submit
    handleSubmit(e);
  };

  // Handle the checkbox change event
  const handleCheckboxChange = (data: any) => {
    // Check if the selected messages include the data
    if (selectedMessages.includes(data)) {
      // Remove the data from the selected messages
      const updatedSelectedMessages = selectedMessages.filter(
        (messageId) => messageId !== data
      );
      // Set the selected messages state with the updated selected messages
      setSelectedMessages(updatedSelectedMessages);
      // Check if the updated selected messages length is 0
    } else {
      // Add the data to the selected messages
      setSelectedMessages((prevSelectedMessages) =>
        prevSelectedMessages.concat(data)
      );
    }
  };

  // Handle the rating
  const handleRating = () => {
    // Check if the rating is not null
    const updatedMessages = chatMessages.map(m => {
      // Check if the completion is equal to the selected message id
      if (m.completion === selectedMessageId) {
        return {
          ...m,
          rating: rating as null,
        };
      }
      return m;
    });
    // Save the updated messages to the local storage
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    // Set the chat messages state with the updated messages
    setChatMessages(updatedMessages as { input: string; completion: string; rating: null; createdAtInput: Date; createdAtCompletion: Date }[]); // Cast updatedMessages to the correct type
    // Close the modal
    if (modalLikeRef.current) {
      modalLikeRef.current.close();
    }
    if (modalDisLikeRef.current) {
      modalDisLikeRef.current.close();
    }
  };

  // Check all messages
  const checkedAll = () => {
    setSelectedMessages([])
    // Check if the selected messages length is not equal to the chat messages length
    chatMessages.forEach(m => {
      setSelectedMessages(prevSelectedMessages => [...prevSelectedMessages, m.input, m.completion]);
    })
  }

  // Delete the selected messages
  const deleteMessage = () => {
    let storedMessages = JSON.parse(localStorage.getItem('chatMessages') ?? '') || [];
    // Filter the chat messages
    // if when the input is selected
    selectedMessages.forEach(input => {
      storedMessages = storedMessages.map((m: { input: string }) => {
        if (m.input === input) {
          return { ...m, input: '' };
        }
        return m;
      });
    });
    // Filter the chat messages
    // if when the completion is selected
    selectedMessages.forEach((completion: string) => {
      storedMessages = storedMessages.map((m: { completion: string }) => {
        if (m.completion === completion) {
          return { ...m, completion: '' };
        }
        return m;
      });
    });
    // Save the stored messages to the local storage
    localStorage.setItem('chatMessages', JSON.stringify(storedMessages));
    // Set the chat messages state with the stored messages
    setChatMessages(storedMessages);
    // Reset the selected messages
    setSelectedMessages([]);
    setShowCheckbox(false);
    // Close the modal
    if (modalDeleteRef.current) {
      modalDeleteRef.current.close();
    }
  }

  return (
    <div className="grid grid-cols-1">
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
        <div>
          {error && (
            <div className="p-4 text-center">
              {error.message}
            </div>
          )}
          {chatMessages.map((m, index) => (
            <div key={index} className='px-4 mt-4'>
              {m.input && (
                <div className='flex items-end gap-1 justify-end my-2'>
                  <div className='chat chat-end w-full'>
                    <div className='chat-bubble bg-gray-200'>
                      <div className='flex items-center'>
                        <p className='text-black'>{m.input}</p>
                        <span className='text-xs ml-2 text-gray-500'>
                          {moment(m.createdAtInput).format('HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {showCheckbox && (<input type="checkbox" className="checkbox"
                    checked={selectedMessages.includes(m.input)}
                    onChange={() => handleCheckboxChange(m.input)} />)}
                </div>
              )}

              {m.completion && (
                <div className='flex gap-1 items-end'>
                  {showCheckbox && (<input type="checkbox" className="checkbox"
                    checked={selectedMessages.includes(m.completion)}
                    onChange={() => handleCheckboxChange(m.completion)} />)}

                  <div className="chat-image avatar">
                    <div className="w-8 rounded-full">
                      <Image alt="" src="/avatar.jpg" width={500}
                        height={500} />
                    </div>
                  </div>
                  <div className='chat chat-start w-full'>
                    <div className='chat-bubble bg-[#2c2e63]'>
                      <div className='flex items-center'>
                        <p className='text-white'>{m.completion}</p>
                        <span className='text-xs ml-2 text-white'>
                          {moment(m.createdAtCompletion).format('HH:mm')}
                        </span>
                      </div>
                      <div className='flex gap-4 items-center justify-end p-2'>
                        <button onClick={() => {
                          setFeedbackText('');
                          setSelectedMessageId(m.completion);
                          setRating('like');
                          const modalLike = document.getElementById('modalLike') as HTMLDialogElement;
                          if (modalLike) {
                            modalLike.showModal();
                          }
                        }}>
                          <FontAwesomeIcon
                            icon={m.rating === 'like' ? faThumbsUpSolid : faThumbsUpRegular}
                          />
                        </button>
                        <button onClick={() => {
                          setFeedbackText('');
                          setSelectedMessageId(m.completion);
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
                    </div>
                  </div>
                </div>

              )}

            </div>
          ))}
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
            <form onSubmit={handleFormSubmit} className='w-full fixed bg-white bottom-0 p-4'>
              <input
                className="input input-bordered w-full"
                value={input}
                placeholder="Send Message..."
                onChange={handleInputChange}
              />
            </form>
          )}
        </div>
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
