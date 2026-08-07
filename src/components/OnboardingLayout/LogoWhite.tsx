import Link from 'next/link';
import Image from 'next/image';

export default function LogoWhite() {
    return (
        <Link href="/" className="flex items-center">
            <Image
                src="/logo.svg"
                alt="Taxable"
                width={80}
                height={49}
                priority
            />
        </Link>
    );
}
