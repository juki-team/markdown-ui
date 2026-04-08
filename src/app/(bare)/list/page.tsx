'use client';

import {
  AddIcon,
  Button,
  ButtonLoader,
  Field,
  FieldDate,
  FieldText,
  Input,
  LoginUser,
  Modal,
  PagedDataViewer,
  T,
  TwoContentLayout,
  UserChip,
} from 'components';
import { jukiApiManager } from 'config';
import { EMPTY_ENTITY_MEMBERS } from 'config/constants';
import { authorizedRequest, cleanRequest, oneTab, toFilterUrl, toSortUrl } from 'helpers';
import { useJukiNotification, useRouterStore } from 'hooks';
import { useState } from 'react';
import { CodeLanguage, ContentResponse, DataViewerHeadersType, MarkdownResponseDTO, Status } from 'types';

const MARKDOWN_COLUMNS: DataViewerHeadersType<MarkdownResponseDTO>[] = [
  {
    index: 'name',
    head: 'name',
    minWidth: 200,
    Field: ({ record }) => <FieldText label={<T>name</T>} text={record.name} />,
    sort: true,
  },
  {
    index: 'key',
    head: 'key',
    minWidth: 120,
    Field: ({ record }) => <FieldText label={<T>key</T>} text={record.key} />,
    sort: true,
  },
  {
    index: 'owner',
    head: 'owner',
    minWidth: 140,
    Field: ({ record: { owner } }) => (
      <Field className="jk-row">
        <UserChip imageUrl={owner.imageUrl} nickname={owner.nickname} companyKey={owner.company.key} />
      </Field>
    ),
    sort: true,
  },
  {
    index: 'updatedAt',
    head: 'updated',
    minWidth: 160,
    Field: ({ record }) => <FieldDate label={<T>key</T>} date={new Date(record.updatedAt)} twoLines />,
    sort: true,
  },
  {
    index: 'createdAt',
    head: 'created',
    minWidth: 160,
    Field: ({ record }) => <FieldDate label={<T>key</T>} date={new Date(record.createdAt)} twoLines />,
    sort: true,
  },
];

const EMPTY_ENTITY_MEMBERS_DTO = () => {
  const members = EMPTY_ENTITY_MEMBERS();
  return {
    rankAdministrators: members.rankAdministrators,
    administrators: Object.keys(members.administrators),
    rankManagers: members.rankManagers,
    managers: Object.keys(members.managers),
    rankParticipants: members.rankParticipants,
    participants: Object.keys(members.participants),
    rankGuests: members.rankGuests,
    guests: Object.keys(members.guests),
    rankSpectators: members.rankSpectators,
    spectators: Object.keys(members.spectators),
  };
};

export default function Page() {
  const pushRoute = useRouterStore((state) => state.pushRoute);
  const { notifyResponse } = useJukiNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');

  return (
    <>
      <TwoContentLayout
        tabs={oneTab(
          <PagedDataViewer<MarkdownResponseDTO>
            name="markdown-list"
            headers={MARKDOWN_COLUMNS}
            getUrl={({ pagination: { page, pageSize }, filter, sort }) =>
              jukiApiManager.API_V2.markdown.getSummaryList({
                params: { page, pageSize, filterUrl: toFilterUrl(filter), sortUrl: toSortUrl(sort) },
              }).url
            }
            refreshInterval={30000}
            onRecordClick={({ data, index }) => pushRoute(`/${data[index].key}`)}
          />,
        )}
        headerClassName="jk-col stretch"
      >
        <div className="jk-row gap">
          <h2>
            <T className="tt-se">your documents</T>
          </h2>
          <div className="flex-1" />
          <Button icon={<AddIcon size="small" />} onClick={() => setModalOpen(true)}>
            <T className="tt-se">new</T>
          </Button>
          <div className="jk-row">
            <LoginUser withLabel />
          </div>
        </div>
        <p className="tx-s cr-tx-sc tt-se">
          <T>manage, organize and browse your markdown documents in one place</T>
        </p>
      </TwoContentLayout>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} closeIcon closeOnKeyEscape closeOnClickOverlay>
        <div className="jk-col gap jk-pg stretch">
          <div className="fw-bd tt-se tx-l">
            <T>new document</T>
          </div>
          <form className="jk-col gap" onSubmit={(e) => e.preventDefault()}>
            <Input expand label={<T className="tt-se cr-hd tx-s">name</T>} value={name} onChange={setName} autoFocus />
            <div className="jk-row gap nowrap right wh-100">
              <Button type="secondary">
                <T className="tt-se">cancel</T>
              </Button>
              <ButtonLoader
                submit
                onClick={async (setLoaderStatus) => {
                  setLoaderStatus(Status.LOADING);
                  const { url, ...options } = jukiApiManager.API_V2.markdown.create({
                    body: {
                      name,
                      members: EMPTY_ENTITY_MEMBERS_DTO(),
                      tags: [],
                      files: {
                        'document.md': {
                          source: '',
                          language: CodeLanguage.MARKDOWN,
                          index: 0,
                          name: 'document.md',
                          hidden: false,
                          readonly: false,
                          protected: false,
                        },
                      } as never,
                    },
                  });
                  const response = cleanRequest<ContentResponse<{ key: string }>>(await authorizedRequest(url, options));
                  if (notifyResponse(response, setLoaderStatus)) {
                    pushRoute(`/e/${response.content.key}`);
                  }
                }}
              >
                <T className="tt-se">create</T>
              </ButtonLoader>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
