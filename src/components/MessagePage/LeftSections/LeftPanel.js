import React, { useRef, useState } from "react";
import MessageLists from "./MessageLists";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentMessageListsType } from "../../../redux/actions/message_actions";
import Modal from "react-modal";
import MessageInputModal from "../../../common/components/SendMessageModal/MessageInputModal";
import { messageInputModalStyle } from "../../../common/styles";
import { writeDebug } from "../../../common/ipcCommunication/ipcLogger";

function LeftPanel() {
  const [isOpenMessageInputModal, setIsOpenMessageInputModal] = useState(false);
  const dispatch = useDispatch();
  const searchbarRef = useRef(null);
  const currentMessageListType = useSelector(
    (state) => state.messages.currentMessageListType
  );
  const onChangeMessageListsTypeClick = (msgType) => {

    writeDebug('MessagePage -- currentMessageListType Change.', currentMessageListType );

    dispatch(setCurrentMessageListsType(msgType));
  };
  const onOpenMessageInputModalClick = () => {
    setIsOpenMessageInputModal(true);
  };
  const MessageInputModalClose = () => {
    setIsOpenMessageInputModal(false);
  };
  const handleClickSearchbar = () => {
    searchbarRef.current.focus();
  };

  return (
    <div className="message-list-area">
      <div className="message-page-title-wrap">
        <h4 className="page-title">쪽지</h4>
        <div
          className={`message-tab receive ${
            currentMessageListType === "RECV" && "current"
          }`}
          onClick={() => onChangeMessageListsTypeClick("RECV")}
        >
          수신
        </div>
        <div
          className={`message-tab sent ${
            currentMessageListType === "SEND" && "current"
          }`}
          onClick={() => onChangeMessageListsTypeClick("SEND")}
        >
          발신
        </div>
        {/* <div className="message-tab booked">예약</div>
                <div className="message-tab file">파일함</div> */}
        <div className="message-list-action-wrap">
          <button
            className="message-list-action add"
            title="쪽지쓰기"
            onClick={onOpenMessageInputModalClick}
          ></button>
          <div className="message-list-action search" title="쪽지 검색">
            <input type="checkbox" id="message-list-search-toggle-check" />
            <label
              className="message-list-search-toggle"
              htmlFor="message-list-search-toggle-check"
            ></label>
            <div
              className="message-list-search-wrap"
              onClick={handleClickSearchbar}
            >
              <input
                type="text"
                // className="message-list-search"
                placeholder="이름, 내용, 파일명, 일시 검색"
                ref={searchbarRef}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="message-list-wrap">
        <ul>
          <MessageLists />
        </ul>
      </div>

      <Modal
        isOpen={isOpenMessageInputModal}
        onRequestClose={MessageInputModalClose}
        style={messageInputModalStyle}
        shouldCloseOnOverlayClick={false}
      >
        <MessageInputModal closeModalFunction={MessageInputModalClose} />
      </Modal>
    </div>
  );
}

export default LeftPanel;

Modal.setAppElement("#root");
