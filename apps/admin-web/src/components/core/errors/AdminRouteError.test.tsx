import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '~/lib/error-parser';
import { AdminRouteError } from './AdminRouteError';

describe('AdminRouteError', () => {
  it('renders a designed route error page with a friendly server error message', () => {
    render(<AdminRouteError error={new Error('Internal server error')} reset={vi.fn()} />);

    expect(screen.getByRole('heading', { name: '页面暂时不可用' })).toBeInTheDocument();
    expect(screen.getByText('服务端暂时没有处理成功，请稍后重试。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /重试/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /回到首页/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /刷新页面/ })).toBeInTheDocument();
  });

  it('renders API errors as structured diagnostics instead of a raw stack trace', async () => {
    const user = userEvent.setup();
    const error = new ApiError({ message: 'Internal server error', status: 500 });
    error.stack = 'ApiError: Internal server error\n    at onResponseError';

    render(<AdminRouteError error={error} reset={vi.fn()} />);

    expect(screen.getByText('服务端暂时没有处理成功，请稍后重试。')).toBeInTheDocument();
    await user.click(screen.getByText('错误详情'));

    expect(screen.getByText(/类型：接口请求失败/)).toBeInTheDocument();
    expect(screen.getByText(/状态码：500/)).toBeInTheDocument();
    expect(screen.queryByText(/onResponseError/)).not.toBeInTheDocument();
  });

  it('renders forbidden API errors as an access denied page instead of a crash page', () => {
    const error = new ApiError({ message: '无权访问该资源', status: 403 });

    render(<AdminRouteError error={error} reset={vi.fn()} />);

    expect(screen.getByRole('heading', { name: '访问受限' })).toBeInTheDocument();
    expect(screen.getByText('当前账号没有访问这个页面的权限。')).toBeInTheDocument();
    expect(screen.getByText('需要系统管理权限')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /切换账号/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '页面暂时不可用' })).not.toBeInTheDocument();
    expect(screen.queryByText('错误详情')).not.toBeInTheDocument();
  });
});
