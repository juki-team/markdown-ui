'use server';

import { HEADER_JUKI_FORWARDED_HOST } from 'config/constants';
import { cookies, headers } from 'next/headers';
import { ContentResponse, ContentsResponse, ErrorCode, ErrorResponse } from 'types';
import { cleanRequest, getAuthorizedRequest } from './commons';

export const get = async <T extends ContentResponse<unknown> | ContentsResponse<unknown>>(url: string) => {
  try {
    const headersStore = await headers();

    const cookieStore = await cookies();

    const host = headersStore.get('host') || '';
    const protocol = headersStore.get('x-forwarded-proto') ?? 'https';
    const origin = `${protocol}://${host}`;
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');
    const customHeaders = {
      origin,
      referer: origin + '/',
      [HEADER_JUKI_FORWARDED_HOST]: host,
      Cookie: cookieHeader,
    };

    return cleanRequest<T>(
      await getAuthorizedRequest(encodeURI(url), {
        headers: customHeaders,
      }),
    );
  } catch (error) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: (error as Error)?.message ?? `Error on get "${url}"`,
      errors: [
        {
          code: ErrorCode.ERR500,
          detail: (error as Error)?.message ?? `Error on get "${url}"`,
          message: (error as Error)?.stack ?? `Error on get "${url}" ${error}`,
        },
      ],
    };
    return errorResponse;
  }
};
