import React, { MouseEventHandler, useContext, useState } from 'react';
import { Download } from 'lucide-react';

import ImageIcon from '../assets/icons/image-16.svg';
import ChevronDownIcon from '../assets/icons/chevron-down-16.svg';
import ClipboardIcon from '../assets/icons/clipboard-16.svg';
import ArrowsExpandingIcon from '../assets/icons/arrows-expanding-16.svg';

import { FrameContext } from '../store/FrameContextStore';
import { derivedFlashMessageAtom, flashShownAtom } from '../store/flash';
import { fileNameAtom } from '../store';
import download from '../util/download';
import { toPng, toSvg, toBlob } from '../lib/image';

import useHotkeys from '@/utils/useHotkeys';
import usePngClipboardSupported from '../util/usePngClipboardSupported';
import { useAtom, useAtomValue } from 'jotai';
import {
  EXPORT_SIZE_OPTIONS,
  SIZE_LABELS,
  exportSizeAtom,
} from '../store/image';
import { ButtonGroup } from '@/components/button-group';
import { Button } from '@/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import { Kbd, Kbds } from '@/components/kbd';

const ExportButton: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pngClipboardSupported = usePngClipboardSupported();
  const frameContext = useContext(FrameContext);
  const [, setFlashMessage] = useAtom(derivedFlashMessageAtom);
  const [, setFlashShown] = useAtom(flashShownAtom);
  const customFileName = useAtomValue(fileNameAtom);
  const fileName = customFileName.replaceAll(' ', '-') || 'ray-so-export';
  const [exportSize, setExportSize] = useAtom(exportSizeAtom);

  const savePng = async () => {
    if (!frameContext?.current) {
      throw new Error("Couldn't find a frame to export");
    }

    setFlashMessage({ icon: <ImageIcon />, message: 'Exporting PNG' });

    const dataUrl = await toPng(frameContext.current, {
      pixelRatio: exportSize,
    });

    download(dataUrl, `${fileName}.png`);

    setFlashShown(false);
  };

  const copyPng = async () => {
    setFlashMessage({ icon: <ClipboardIcon />, message: 'Copying PNG' });
    if (!frameContext?.current) {
      throw new Error("Couldn't find a frame to export");
    }

    const clipboardItem = new ClipboardItem({
      'image/png': toBlob(frameContext.current, {
        pixelRatio: exportSize,
      }).then((blob) => {
        if (!blob) {
          throw new Error('expected toBlob to return a blob');
        }
        return blob;
      }),
    });

    await navigator.clipboard.write([clipboardItem]);

    setFlashMessage({
      icon: <ClipboardIcon />,
      message: 'PNG Copied to clipboard!',
      timeout: 2000,
    });
  };

  const saveSvg = async () => {
    if (!frameContext?.current) {
      throw new Error("Couldn't find a frame to export");
    }

    setFlashMessage({ icon: <ImageIcon />, message: 'Exporting SVG' });

    const dataUrl = await toSvg(frameContext.current);
    download(dataUrl, `${fileName}.svg`);

    setFlashShown(false);
  };

  const dropdownHandler: (handler: () => void) => (event: Event) => void = (
    handler
  ) => {
    return (event) => {
      event.preventDefault();
      handler();
      setDropdownOpen(false);
    };
  };

  const handleExportClick: MouseEventHandler = (event) => {
    event.preventDefault();
    savePng();
  };

  const copyUrl = async () => {
    setFlashMessage({ icon: <ClipboardIcon />, message: 'Copying URL' });

    const url = window.location.toString();
    let urlToCopy = url;

    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(
      `/api/shorten-url?url=${encodedUrl}&ref=codeImage`
    ).then((res) => res.json());

    if (response.link) {
      urlToCopy = response.link;
    }

    navigator.clipboard.writeText(urlToCopy);

    setFlashMessage({
      icon: <ClipboardIcon />,
      message: 'URL Copied to clipboard!',
      timeout: 2000,
    });
  };

  useHotkeys('ctrl+k,cmd+k', (event) => {
    event.preventDefault();
    setDropdownOpen((open) => !open);
  });

  useHotkeys('ctrl+s,cmd+s', (event) => {
    event.preventDefault();
    savePng();
  });
  useHotkeys('ctrl+c,cmd+c', (event) => {
    if (pngClipboardSupported) {
      event.preventDefault();
      copyPng();
    }
  });
  useHotkeys('ctrl+shift+c,cmd+shift+c', (event) => {
    event.preventDefault();
    copyUrl();
  });
  useHotkeys('ctrl+shift+s,cmd+shift+s', (event) => {
    event.preventDefault();
    saveSvg();
  });

  return (
    <ButtonGroup>
      <Button
        onClick={handleExportClick}
        variant='primary'
        aria-label='Export as PNG'
      >
        <Download className='w-4 h-4' />
        Export <span className='hidden md:inline-block'>Image</span>
      </Button>
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={(open) => setDropdownOpen(open)}
      >
        <DropdownMenuTrigger asChild>
          <Button variant='primary' aria-label='See other export options'>
            <ChevronDownIcon className='w-4 h-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='bottom' align='end'>
          <DropdownMenuItem onSelect={dropdownHandler(savePng)}>
            <ImageIcon /> Save PNG{' '}
            <Kbds>
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd>
            </Kbds>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={dropdownHandler(saveSvg)}>
            <ImageIcon /> Save SVG
            <Kbds>
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>S</Kbd>
            </Kbds>
          </DropdownMenuItem>
          {pngClipboardSupported && (
            <DropdownMenuItem onSelect={dropdownHandler(copyPng)}>
              <ClipboardIcon /> Copy Image
              <Kbds>
                <Kbd>⌘</Kbd>
                <Kbd>C</Kbd>
              </Kbds>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger value={SIZE_LABELS[exportSize]}>
              <ArrowsExpandingIcon /> Size
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent sideOffset={8}>
              <DropdownMenuRadioGroup value={exportSize.toString()}>
                {EXPORT_SIZE_OPTIONS.map((size) => (
                  <DropdownMenuRadioItem
                    key={size}
                    value={size.toString()}
                    onSelect={() => setExportSize(size)}
                  >
                    {SIZE_LABELS[size]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
};

export default ExportButton;
