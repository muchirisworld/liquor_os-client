import { FullWidthDivider } from "@/components/ui/full-width-divider";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { HomeIcon, CompassIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
	return (
		<div className="flex w-full items-center justify-center overflow-hidden">
			<div className="flex h-screen items-center border-x">
				<div>
					<FullWidthDivider />
					<Empty>
						<EmptyHeader>
							<EmptyTitle className="font-black font-mono text-8xl">
								404
							</EmptyTitle>
							<EmptyDescription className="text-nowrap">
								The page you're looking for might have been <br />
								moved or doesn't exist.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<div className="flex gap-2">
								<Button
                                    render={
										<Link to="/">
											<HugeiconsIcon icon={HomeIcon} data-icon="inline-start" />
											Go Home
										</Link>
									}
								/>

								<Button
                                    variant="outline"
                                render={
									<Link to="/">
										<HugeiconsIcon icon={CompassIcon} data-icon="inline-start" />
										Explore
									</Link>}
								/>
							</div>
						</EmptyContent>
					</Empty>
					<FullWidthDivider />
				</div>
			</div>
		</div>
	);
}
