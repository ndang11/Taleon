import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, trim: true })
	name!: string;

	@Prop({
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		index: true,
	})
	email!: string;

	@Prop({ required: true, select: false })
	password!: string;

	@Prop({ type: Types.ObjectId, ref: "Tenant", required: true })
	tenantId!: Types.ObjectId;

	// Profile fields
	@Prop({ default: "" })
	bio!: string;

	@Prop({ default: "" })
	avatar!: string;

	@Prop({ default: "" })
	coverImage!: string;

	@Prop({ default: "" })
	location!: string;

	@Prop({ default: "" })
	website!: string;

	@Prop({ default: "" })
	phone!: string;

	@Prop({ default: "", trim: true, lowercase: true })
	username!: string;

	@Prop({ default: "", trim: true, lowercase: true })
	subdomain!: string;

	@Prop({ default: "", trim: true, lowercase: true })
	customDomain!: string;

	@Prop({ default: "daily", enum: ["daily", "weekly", "off"] })
	digestFrequency!: "daily" | "weekly" | "off";

	@Prop({ default: false })
	feedbackOptIn!: boolean;

	@Prop({ default: false })
	allowPrivateNotes!: boolean;

	@Prop({ default: false })
	allowEmailReplies!: boolean;

	@Prop({ default: "", trim: true, lowercase: true })
	replyToEmail!: string;

	@Prop({ default: true })
	notifNewMediumDigest!: boolean;

	@Prop({ default: true })
	notifRecommendedReading!: boolean;

	@Prop({ default: true })
	notifSavedListStories!: boolean;

	@Prop({ default: true })
	notifFollowsHighlights!: boolean;

	@Prop({ default: true })
	notifRepliesToResponses!: boolean;

	@Prop({ default: "in_network", enum: ["in_network", "off"] })
	notifStoryMentions!: "in_network" | "off";

	@Prop({ default: true })
	notifActivityOnPublished!: boolean;

	@Prop({ default: true })
	notifActivityOnLists!: boolean;

	@Prop({ default: true })
	notifEditorsFeatureStories!: boolean;

	@Prop({ default: true })
	notifNewSubmissions!: boolean;

	@Prop({ default: true })
	notifSubmissionStatusChanges!: boolean;

	@Prop({ default: true })
	notifNewProductFeatures!: boolean;

	@Prop({ default: true })
	notifMembershipInfo!: boolean;

	@Prop({ default: true })
	googleConnected!: boolean;

	@Prop({ default: false })
	mastodonAccountCreated!: boolean;

	@Prop({ default: false })
	mastodonConnected!: boolean;

	@Prop({ default: false })
	facebookConnected!: boolean;

	@Prop({ default: false })
	xConnected!: boolean;

	@Prop({ default: null })
	lastSignOutOthersAt!: Date | null;

	@Prop({ default: 0 })
	followersCount!: number;

	@Prop({ default: 0 })
	followingCount!: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
