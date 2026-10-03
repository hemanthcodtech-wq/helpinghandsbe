--
-- PostgreSQL database dump
--

\restrict fg9Ml3Dx4JVHAQ8pmQBwDXHGjOXAQXdd8lcvR6WeIRnmvN6qhPgrhH7zeMugKh4

-- Dumped from database version 18.6 (4e955f5)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA neon_auth;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_accounts (
    id integer NOT NULL,
    bank_name character varying(255) NOT NULL,
    account_name character varying(255) NOT NULL,
    account_number character varying(255) NOT NULL,
    ifsc_code character varying(255) NOT NULL,
    branch character varying(255),
    qr_code_url text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_accounts_id_seq OWNED BY public.bank_accounts.id;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    text text,
    image text,
    raised integer,
    goal character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    target_amount integer DEFAULT 0
);


--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- Name: coordinator_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coordinator_collections (
    id integer NOT NULL,
    coordinator_id integer,
    name character varying(255) NOT NULL,
    mobile character varying(50) NOT NULL,
    email character varying(255),
    amount numeric NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    collection_date date
);


--
-- Name: coordinator_collections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coordinator_collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coordinator_collections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coordinator_collections_id_seq OWNED BY public.coordinator_collections.id;


--
-- Name: coordinator_donors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coordinator_donors (
    id integer NOT NULL,
    coordinator_id integer,
    name character varying(255) NOT NULL,
    aadhar_number character varying(50) NOT NULL,
    amount_needed numeric NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: coordinator_donors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coordinator_donors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coordinator_donors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coordinator_donors_id_seq OWNED BY public.coordinator_donors.id;


--
-- Name: donations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donations (
    id integer NOT NULL,
    amount character varying(50) NOT NULL,
    payment_method character varying(50) NOT NULL,
    recurring boolean DEFAULT false,
    designation character varying(100),
    name character varying(255) NOT NULL,
    gender character varying(50),
    parent_name character varying(255),
    dob date,
    profession character varying(255),
    blood_group character varying(10),
    email character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    aadhaar character varying(50),
    state character varying(100),
    district character varying(100),
    working_area character varying(255),
    pincode character varying(20),
    address text,
    profile_pic_url text,
    aadhaar_front_url text,
    aadhaar_back_url text,
    txn_id character varying(100),
    status character varying(50) DEFAULT 'success'::character varying,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    campaign character varying(100) DEFAULT 'Membership'::character varying,
    campaign_id integer,
    pan_number character varying(50),
    requests_80g boolean DEFAULT false
);


--
-- Name: donations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.donations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: donations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.donations_id_seq OWNED BY public.donations.id;


--
-- Name: events_news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_news (
    id integer NOT NULL,
    type character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    event_date character varying(50) NOT NULL,
    location character varying(255),
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_url character varying(255)
);


--
-- Name: events_news_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_news_id_seq OWNED BY public.events_news.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    password_hash text NOT NULL,
    membership_tier character varying(255),
    aadhaar character varying(255),
    address text,
    state character varying(255),
    district character varying(255),
    pincode character varying(255),
    blood_group character varying(10),
    profile_picture_url text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partners (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    image_url text,
    website_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: partners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partners_id_seq OWNED BY public.partners.id;


--
-- Name: programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.programs (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    image_url text,
    tag character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: programs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.programs_id_seq OWNED BY public.programs.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    category character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    file_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    key character varying(255) NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    group_name character varying(50) NOT NULL,
    image_url text,
    email character varying(255),
    is_visible boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    quote text NOT NULL,
    image_url text,
    rating integer DEFAULT 5,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    role character varying(50) NOT NULL,
    name character varying(255),
    phone character varying(50),
    city character varying(255),
    message text,
    status character varying(50) DEFAULT 'approved'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    gender character varying(50),
    parent_name character varying(255),
    dob date,
    profession character varying(255),
    blood_group character varying(10),
    aadhaar character varying(20),
    state character varying(100),
    district character varying(100),
    working_area character varying(255),
    pincode character varying(20),
    address text,
    profile_pic_url character varying(255),
    aadhaar_front_url character varying(255),
    aadhaar_back_url character varying(255)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: volunteer_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_activities (
    id integer NOT NULL,
    volunteer_id integer,
    title character varying(255) NOT NULL,
    date date NOT NULL,
    hours integer NOT NULL,
    status character varying(50) NOT NULL
);


--
-- Name: volunteer_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.volunteer_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: volunteer_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.volunteer_activities_id_seq OWNED BY public.volunteer_activities.id;


--
-- Name: volunteer_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_campaigns (
    id integer NOT NULL,
    volunteer_id integer,
    campaign_name character varying(255) NOT NULL,
    date date NOT NULL,
    status character varying(50) NOT NULL,
    role character varying(100) NOT NULL
);


--
-- Name: volunteer_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.volunteer_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: volunteer_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.volunteer_campaigns_id_seq OWNED BY public.volunteer_campaigns.id;


--
-- Name: volunteer_certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_certificates (
    id integer NOT NULL,
    volunteer_id integer,
    name character varying(255) NOT NULL,
    date date NOT NULL,
    issuer character varying(255) NOT NULL
);


--
-- Name: volunteer_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.volunteer_certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: volunteer_certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.volunteer_certificates_id_seq OWNED BY public.volunteer_certificates.id;


--
-- Name: volunteer_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_programs (
    id integer NOT NULL,
    volunteer_id integer,
    program_name character varying(255) NOT NULL,
    schedule character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    status character varying(50) NOT NULL
);


--
-- Name: volunteer_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.volunteer_programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: volunteer_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.volunteer_programs_id_seq OWNED BY public.volunteer_programs.id;


--
-- Name: volunteer_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_updates (
    id integer NOT NULL,
    volunteer_id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: volunteer_updates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.volunteer_updates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: volunteer_updates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.volunteer_updates_id_seq OWNED BY public.volunteer_updates.id;


--
-- Name: bank_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.bank_accounts_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: coordinator_collections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coordinator_collections ALTER COLUMN id SET DEFAULT nextval('public.coordinator_collections_id_seq'::regclass);


--
-- Name: coordinator_donors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coordinator_donors ALTER COLUMN id SET DEFAULT nextval('public.coordinator_donors_id_seq'::regclass);


--
-- Name: donations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations ALTER COLUMN id SET DEFAULT nextval('public.donations_id_seq'::regclass);


--
-- Name: events_news id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_news ALTER COLUMN id SET DEFAULT nextval('public.events_news_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.partners_id_seq'::regclass);


--
-- Name: programs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programs ALTER COLUMN id SET DEFAULT nextval('public.programs_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: volunteer_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_activities ALTER COLUMN id SET DEFAULT nextval('public.volunteer_activities_id_seq'::regclass);


--
-- Name: volunteer_campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_campaigns ALTER COLUMN id SET DEFAULT nextval('public.volunteer_campaigns_id_seq'::regclass);


--
-- Name: volunteer_certificates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_certificates ALTER COLUMN id SET DEFAULT nextval('public.volunteer_certificates_id_seq'::regclass);


--
-- Name: volunteer_programs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_programs ALTER COLUMN id SET DEFAULT nextval('public.volunteer_programs_id_seq'::regclass);


--
-- Name: volunteer_updates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_updates ALTER COLUMN id SET DEFAULT nextval('public.volunteer_updates_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.invitation (id, "organizationId", email, role, status, "expiresAt", "createdAt", "inviterId") FROM stdin;
\.


--
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.jwks (id, "publicKey", "privateKey", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.member (id, "organizationId", "userId", role, "createdAt") FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.organization (id, name, slug, logo, "createdAt", metadata) FROM stdin;
\.


--
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.project_config (id, name, endpoint_id, created_at, updated_at, trusted_origins, social_providers, email_provider, email_and_password, allow_localhost, plugin_configs, webhook_config) FROM stdin;
2090b3ac-61d8-4ecf-981d-c621a9a66744	helpinghands	ep-cold-dew-ax4qqjjj	2026-08-22 09:11:25.829+00	2026-08-22 09:11:25.829+00	[]	[{"id": "google", "isShared": true}]	{"type": "shared"}	{"enabled": true, "disableSignUp": false, "emailVerificationMethod": "otp", "requireEmailVerification": false, "autoSignInAfterVerification": true, "sendVerificationEmailOnSignIn": false, "sendVerificationEmailOnSignUp": false}	t	{"magicLink": {"config": {"expiresIn": 5, "disableSignUp": false}, "enabled": false}, "phoneNumber": {"config": {"otp_expires_in": 300}, "enabled": false}, "organization": {"config": {"creatorRole": "owner", "membershipLimit": 100, "organizationLimit": 10, "sendInvitationEmail": false}, "enabled": true}}	{"enabled": false, "enabledEvents": [], "timeoutSeconds": 5}
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId", "impersonatedBy", "activeOrganizationId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role, banned, "banReason", "banExpires") FROM stdin;
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_accounts (id, bank_name, account_name, account_number, ifsc_code, branch, qr_code_url, is_active, created_at) FROM stdin;
1	SBI	HELPING HANDS FOUNDATION	110250585121	CNRB0006162	KANDUKUR	https://res.cloudinary.com/dgyykbmt6/image/upload/v1789048143/helpinghands/bank_accounts/vuazdm0uz03apyrzzehj.png	t	2026-09-10 13:49:07.595145
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.campaigns (id, name, text, image, raised, goal, created_at, target_amount) FROM stdin;
1	Every Child Deserves Education	Support learning materials, school supplies and educational opportunities for children.	https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85	68	₹5,00,000	2026-08-22 10:29:34.183454	500000
2	Healthy Communities	Help fund health camps, awareness programs and essential community care.	https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=85	45	₹3,50,000	2026-08-22 10:29:34.183454	350000
3	Meals With Dignity	Provide nutritious meals and food support to families facing hardship.	https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=85	82	₹4,00,000	2026-08-22 10:29:34.183454	400000
4	Women Empowerment Initiative	Support skills, livelihood opportunities and self-reliance for women.	https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85	37	₹6,00,000	2026-08-22 10:29:34.183454	600000
5	Community Relief Fund	Create a rapid-response fund for urgent community needs and relief.	https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1000&q=85	56	₹7,50,000	2026-08-22 10:29:34.183454	750000
6	Green Neighbourhoods	Build cleaner communities through tree planting and environmental activities.	https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85	29	₹2,50,000	2026-08-22 10:29:34.183454	250000
7	Hello	Hello	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790589469/helpinghands/campaigns/wllc4xi1jipcnfbjuybn.jpg	\N	\N	2026-09-28 09:57:49.420783	10000
8	Disaster 	Collection 	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790615769/helpinghands/campaigns/bex2yek3pbudaekgic66.jpg	\N	\N	2026-09-28 17:16:10.501518	435690
\.


--
-- Data for Name: coordinator_collections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coordinator_collections (id, coordinator_id, name, mobile, email, amount, created_at, collection_date) FROM stdin;
1	5	Test Donor	9999999999	test@test.com	500	2026-09-27 11:06:24.11426	\N
2	5	Kancharla Hemanth	8179860935	chinnakancharla1@gmail.com	1000	2026-09-27 11:07:17.805025	\N
\.


--
-- Data for Name: coordinator_donors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coordinator_donors (id, coordinator_id, name, aadhar_number, amount_needed, created_at) FROM stdin;
1	5	Hemanth	123456654321	10000	2026-09-27 11:21:54.213516
\.


--
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.donations (id, amount, payment_method, recurring, designation, name, gender, parent_name, dob, profession, blood_group, email, phone, aadhaar, state, district, working_area, pincode, address, profile_pic_url, aadhaar_front_url, aadhaar_back_url, txn_id, status, date, campaign, campaign_id, pan_number, requests_80g) FROM stdin;
1	599	razorpay	f	Member	Hemanth	Male	Babu Rao	2005-07-07	CEO	O+	kancharlahemanth89@gmail.com	8179860935	617342663248	Andhra Pradesh	spsr nellore	Banglore	560068	Banglore	https://res.cloudinary.com/dgyykbmt6/image/upload/v1787392208/helpinghands/donations/bu8pd6mvmcl4pwr6xvqk.jpg	https://res.cloudinary.com/dgyykbmt6/image/upload/v1787392208/helpinghands/donations/ejj527hajknzgparvucy.jpg	https://res.cloudinary.com/dgyykbmt6/image/upload/v1787392208/helpinghands/donations/hui4dv8kftwubwuaio9s.jpg	TXN2596F30E	success	2026-08-22 09:50:10.833076	Membership	\N	\N	f
2	1000	upi	f	General Donation	Hemanth	\N	\N	\N	\N	\N	kancharlahemanth89@gmail.com	8179860935	PRUPK7370D	\N	\N	\N	\N	BTML	\N	\N	\N	TXN201B982E	success	2026-08-22 10:41:43.236952	Membership	1	\N	f
4	1000	upi	f	General Donation	Chinna	\N	\N	\N	\N	\N	chinna@gmail.com	8179860935	PRUPK7370D	\N	\N	\N	\N	HELLO	\N	\N	\N	TXNFEACA570	success	2026-09-10 08:25:47.526431	Membership	5	\N	f
5	10000	razorpay	f	General Donation	Hello Babu	\N	\N	\N	\N	\N	hello@gmail.com	1234554321	PROIIM8909K	\N	\N	\N	\N	HELLO	\N	\N	\N	TXN5BB1A2D8	success	2026-09-10 08:47:54.957036	Membership	5	\N	f
6	299	razorpay	t	Member	Hemanth	Male	Babu Rao	2026-09-23	FULL	A+	chinnakancharla1@gmail.com	8179860935	123456123456	Telangana	abc	avc	123456	123456	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790159580/helpinghands/donations/hw8kf7er6aqlnuznbtbb.png	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790159580/helpinghands/donations/wfh06bg4bn4rw2k1c9rl.png	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790159580/helpinghands/donations/fjtrfatxxfgplhxmbqjn.png	TXNE610D9AE	success	2026-09-23 10:33:01.255016	Membership	\N	\N	f
7	299	razorpay	f	Member	abc	Female	abc	2026-09-24	abc	A+	abc@gmail.com	1234512345	123456654321	Telangana	abc	abc	abc	abc	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790234666/helpinghands/donations/cf0os3exa5kxg7yn7qie.png	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790234666/helpinghands/donations/j1k2ltr1uqhmj2ioid4s.png	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790234666/helpinghands/donations/kyxff2ad3pthvcr0byb6.png	TXN97CF6BF7	success	2026-09-24 07:24:27.298949	Membership	\N	\N	f
\.


--
-- Data for Name: events_news; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events_news (id, type, title, event_date, location, content, created_at, image_url) FROM stdin;
1	event	Community Health Camp	15 Sep 2026	Local Community Centre	Free basic health screening, awareness sessions and wellness guidance for families.	2026-08-22 11:32:19.220804	\N
2	event	Gandhi Jayanti Service Drive	02 Oct 2026	Community Outreach Area	A volunteer-led cleanliness, food distribution and community service initiative.	2026-08-22 11:32:19.47224	\N
3	event	Children's Education Day	14 Nov 2026	Helping Hands Learning Centre	Learning activities, school-supply support and an inspiring day for children.	2026-08-22 11:32:19.717769	\N
4	news	Helping Hands expands community outreach	20 Aug 2026	\N	Our volunteers are preparing new local outreach activities focused on education, health and community welfare.	2026-08-22 11:32:19.966478	\N
5	news	Volunteer network welcomes new members	12 Aug 2026	\N	More community members have joined our volunteer network to support upcoming programs.	2026-08-22 11:32:20.212874	\N
6	news	Education support initiative begins	28 Jul 2026	\N	A new presentation-phase initiative connects learning support with community participation.	2026-08-22 11:32:20.459806	\N
10	event	Hello	15 sept 1016	Hello	hii	2026-09-28 09:59:11.437837	\N
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.members (id, name, email, phone, password_hash, membership_tier, aadhaar, address, state, district, pincode, blood_group, profile_picture_url, is_active, created_at) FROM stdin;
1	Hemanth	chinnakancharla1@gmail.com	8179860935	$2b$10$Or8g/cA0PByDVOcSXOB9cO5LkrdukjyXp2/LjxvndhmJpCElLh3W.	Gram Panchayat Membership	123456123456	123456	Telangana	abc	123456	A+	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790161292/helpinghands/members/tfjqg2shg6bzhmz1ibcv.png	t	2026-09-23 10:33:02.200286
2	abc	abc@gmail.com	1234512345	$2b$10$/1XN7p4to.789KEB3DdXVOQaTu5cViJMqvS.BD.yu4wkit6TrFnNq	Gram Panchayat Membership	123456654321	abc	Telangana	abc	abc	A+	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790234666/helpinghands/donations/cf0os3exa5kxg7yn7qie.png	t	2026-09-24 07:24:28.068339
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partners (id, name, type, image_url, website_url, created_at) FROM stdin;
1	HDFC	partner	https://res.cloudinary.com/dgyykbmt6/image/upload/v1789034918/helpinghands/partners/d20h0zunibsld2flqdr4.png	\N	2026-09-10 10:08:42.551059
\.


--
-- Data for Name: programs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.programs (id, title, description, image_url, tag, created_at) FROM stdin;
1	Child Education Drive	Supporting school children with books, uniforms and digital learning tools.	/images/program-education.png	Education	2026-08-22 10:17:19.055543
2	Free Health Camp	Free health check-ups, medicines and specialist consultations for rural communities.	/images/program-health.png	Healthcare	2026-08-22 10:17:19.055543
3	Women Skill Centre	Vocational training and self-employment support for underprivileged women.	/images/volunteers.png	Empowerment	2026-08-22 10:17:19.055543
4	Hello	Hello	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790589532/helpinghands/programs/tswqmgcpuneh876jtkx0.jpg	Hi	2026-09-28 09:58:53.641859
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.resources (id, category, title, description, file_url, created_at) FROM stdin;
1	photos	Community Photo 1	Moments from our community initiatives.	/images/gallery-1.png	2026-08-22 10:58:13.960821
2	photos	Community Photo 2	Moments from our community initiatives.	/images/gallery-2.png	2026-08-22 10:58:14.218771
3	photos	Community Photo 3	Moments from our community initiatives.	/images/gallery-3.png	2026-08-22 10:58:14.474493
4	photos	Community Photo 4	Moments from our community initiatives.	/images/gallery-4.png	2026-08-22 10:58:14.722112
5	photos	Community Photo 5	Moments from our community initiatives.	https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:14.96897
6	photos	Community Photo 6	Moments from our community initiatives.	https://images.unsplash.com/photo-1494386346843-e12284507169?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:15.21612
7	photos	Community Photo 7	Moments from our community initiatives.	https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:15.475017
8	photos	Community Photo 8	Moments from our community initiatives.	https://images.unsplash.com/photo-1504159506876-f8338247a14a?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:15.72809
9	photos	Community Photo 9	Moments from our community initiatives.	https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:15.975916
10	photos	Community Photo 10	Moments from our community initiatives.	https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:16.386003
11	photos	Community Photo 11	Moments from our community initiatives.	https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:16.659599
12	photos	Community Photo 12	Moments from our community initiatives.	https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:16.905471
13	photos	Community Photo 13	Moments from our community initiatives.	https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:17.154543
16	photos	Community Photo 16	Moments from our community initiatives.	https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:17.909432
18	photos	Community Photo 18	Moments from our community initiatives.	https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=700&q=80	2026-08-22 10:58:18.42975
19	ngo-darpan	darpan	darpan	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790357331/helpinghands/resources/sdn6wstwgpkah0ohza8p.jpg	2026-09-25 17:28:51.897073
25	videos	Utube	utube	https://www.youtube.com/watch?v=undhkaMMenU&list=RDundhkaMMenU&start_radio=1	2026-10-03 05:26:51.510267
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (key, value) FROM stdin;
global	{"coordNews": true, "metaTitle": "HELPING HANDS FOUNDATION", "pwaEnable": true, "siteTitle": "HELPING HANDS FOUNDATION", "faviconUrl": "", "metaAuthor": "HELPING HANDS FOUNDATION", "pwaAppName": "Helping Hands Foundation NGO", "pwaIconUrl": "https://res.cloudinary.com/dgyykbmt6/image/upload/v1790613850/helpinghands/settings/dwphqywpd0vvox2teaus.png", "websiteUrl": "", "youtubeUrl": "https://www.youtube.com/", "facebookUrl": "https://www.facebook.com/", "linkedinUrl": "https://www.linkedin.com/", "contactEmail": "helpinghandsffoundation@gmail.com", "coordAboutUs": true, "coordGallery": true, "coordSliders": true, "coordYoutube": true, "instagramUrl": "https://www.instagram.com/", "metaKeywords": "Helping hands foundation, education, medical assistance", "pwaShortName": "Helping hands", "siteSubtitle": "Empowering Lives, Enriching Futures.", "coordPartners": true, "coordProjects": true, "footerLogoUrl": "https://res.cloudinary.com/dgyykbmt6/image/upload/v1790613850/helpinghands/settings/obuxgfejjdm0j127a1r0.jpg", "headerLogoUrl": "https://res.cloudinary.com/dgyykbmt6/image/upload/v1790613850/helpinghands/settings/alzunfkcpzhqxqwmxwuu.jpg", "panCardNumber": "AAATG1234F", "coordDocuments": true, "coordTeamAdmin": true, "coordUsersAdmin": true, "metaDescription": "Helping Hands Foundation is a registered non-profit organization...", "coordCertVisitor": true, "contactHeadOffice": "H.No: 4/211/2, SHAKTHI GUDI, ADONI 518301, ADONI MANDAL, KURNOOL DISTRICT, A.P.,", "coordAchievements": true, "coordEventsPortal": true, "coordTestimonials": true, "facebookPixelCode": "", "googleMapEmbedUrl": "<iframe src=\\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3589.0453698084593!2d84.0500445!3d25.900879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399269b39fea4e19%3A0xd74dff6514faf906!2sOnline%20Growth%20Hub!5e0!3m2!1sen!2sin!4v1778880314713!5m2!1sen!2sin\\" width=\\"600\\" height=\\"450\\" style=\\"border:0;\\" allowfullscreen=\\"\\" loading=\\"lazy\\" referrerpolicy=\\"no-referrer-when-downgrade\\"></iframe>", "contactFullAddress": "H.No: 4-187/4, AMBABHAVANI PET, GOWLI PET, \\nADONI 518301, ADONI MANDAL, KURNOOL DISTRICT, A.P.,", "contactPhonePrimary": "+91 7799373766", "contactWorkingHours": "Mon - Sat: 10:00 - 18:00", "coordCertMembership": true, "coordExpenseManager": true, "googleAnalyticsCode": "", "coordDonationsLedger": true, "coordLettersComposer": true, "contactPhoneSecondary": "+91 7093426966", "contactWorkingPresent": "H.No: 4-187/4, AMBABHAVANI PET, GOWLI PET, ADONI 518301, ADONI MANDAL, KURNOOL DISTRICT, A.P.,", "coordCertAppreciation": true, "coordReviewVolunteers": true, "organizationNameHindi": "HELPING HANDS FOUNDATION", "coordCertParticipation": true, "authorizedSignatoryName": "A M PRAVEEN KUMAR ", "coordAppointmentLetters": true, "authorizedSignatoryTitle": "Founder & president ", "coordCampaignsManagement": true, "officialRegistrationInfo": "Reg: UP/2026/012345 | PAN: AAAAA1234A", "googleSearchConsoleVerification": ""}
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, name, role, group_name, image_url, email, is_visible, created_at) FROM stdin;
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, name, role, quote, image_url, rating, created_at) FROM stdin;
1	Kumkuma	Volunteer	Nice	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790589580/helpinghands/testimonials/njlvlwoapdpnen9e45pl.jpg	5	2026-09-28 09:59:41.248484
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, role, name, phone, city, message, status, created_at, gender, parent_name, dob, profession, blood_group, aadhaar, state, district, working_area, pincode, address, profile_pic_url, aadhaar_front_url, aadhaar_back_url) FROM stdin;
1	admin@helpinghands.org	$2b$10$oCA9dxN0bF3i7a.HBY3QxOyRFlr9gG6P4wE4oPrk.Q8iGShdmYffy	admin	\N	\N	\N	\N	approved	2026-08-22 10:10:09.264142	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	volunteer@helpinghands.org	$2b$10$ySUxEJ8qUs3SvmsD5W/BsuaFzbvlXgzi9Lq/R4zAocByE2SIKmQke	volunteer	\N	\N	\N	\N	approved	2026-08-22 10:10:09.264142	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4	kancharlahemanth89@gmail.com	$2b$10$SD1pvJs.aBKtn1443WJCp.H1Kj.GylqIWfrARcgrPNrK9IkM6hKg2	volunteer	Hemanth	8179860935	BANGLORE		approved	2026-08-22 12:02:36.310377	Male	Babu Rao	2006-07-07	CEO	O-	617342663248	AP	SPSR 	BANGLORE	523113	BTML	https://res.cloudinary.com/dgyykbmt6/image/upload/v1787400152/helpinghands/volunteers/itwc2a0kzg8cpu4kbcpd.png	https://res.cloudinary.com/dgyykbmt6/image/upload/v1787400154/helpinghands/volunteers/ku5r9lptbisawy60howa.jpg	https://res.cloudinary.com/dgyykbmt6/image/upload/v1787400154/helpinghands/volunteers/cv27euf6it3biwq5v8oh.png
3	chinnakancharla1@gmail.com	\N	Education Volunteer	Hemanth	8179860935	Banglore	Hii	approved	2026-08-22 10:10:09.264142	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5	kancharla@gmail.com	$2b$10$NIcWwg/dQrrHwe/qdoz5LeCh3fPeDnNOc1ggO.F9ofWZ/5SVBLz.u	coordinator	Hemanth	1234567899	\N	\N	active	2026-09-27 10:48:48.975224	Male	Babu Rao	2026-09-23	ceo	O-	123456654321	Telangana	Na	na	123456	abc	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790506122/helpinghands/coordinators/j8brl8ekmvsxhwl1hvny.jpg	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790506123/helpinghands/coordinators/otfbx5rzxlqdykvs4ked.jpg	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790506125/helpinghands/coordinators/fmyounz8uxf40omkereo.jpg
6	a@gmail.com	$2b$10$E0GBRYOiYQKG.BXdczJ5QuwhDpOFxrjxIl6BYfEj2fyvgDy5JISYm	coordinator	Hello	12122121212121	\N	\N	active	2026-09-28 09:54:19.966641	Female	Hi	2026-09-28	Hello	A+	123456123456	Telangana	123456	123456	123456	123456	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790589256/helpinghands/coordinators/tsxnv8dmq5mt9yppdhx3.png	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790589256/helpinghands/coordinators/t9gjmgupufxahiud2t09.png	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790589256/helpinghands/coordinators/kzle0sb335dhvtka91yn.png
7	lvn242@gmail.com	$2b$10$4f0nxuIsxmYXyg.8.ReJqeP7Ech1GY1BJubfy/3j/eZjrrqStBxN.	volunteer	Praveen	9177193050	Adoni		approved	2026-10-02 10:59:31.310875	Male	Murthy	1978-10-02	Business 	A-	654396510865	Andhra Pradesh 	Kurnool	Adoni	518301	4 /211/2 shakthi gudi adoni 	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790938770/helpinghands/volunteers/fi2xwztue8mztxj4fqf6.jpg	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790938770/helpinghands/volunteers/wykhmwsszgkxtyssjcqa.png	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790938770/helpinghands/volunteers/e6f6vdkvxbybyzg1fmdg.png
8	adonivinayakamitramandali@gmail.com	$2b$10$2.u8d8fXQ1tffIFzIN.zte1RDoTyZhXHUISmIdO.4P6M8ZPyxZ1tO	volunteer	Md ibrahim	9491814647	Adoni		approved	2026-10-02 16:55:51.14322	Male	Md	1990-10-02	Hussain ambulance 	B+	896325478569	Andhra Pradesh 	Kurnool	Adoni	518301	Ado i	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790960150/helpinghands/volunteers/qo4fvoite7yttqvh0sml.jpg	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790960150/helpinghands/volunteers/diqjjmpzhueywpfqt2cg.jpg	https://res.cloudinary.com/dgyykbmt6/image/upload/v1790960150/helpinghands/volunteers/o4dfm3olkfztned8vwbe.jpg
\.


--
-- Data for Name: volunteer_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.volunteer_activities (id, volunteer_id, title, date, hours, status) FROM stdin;
1	2	Education Camp – Delhi	2024-05-15	6	completed
2	2	Health Camp – Noida	2024-05-20	8	upcoming
3	2	Food Drive – Gurgaon	2024-04-28	4	completed
\.


--
-- Data for Name: volunteer_campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.volunteer_campaigns (id, volunteer_id, campaign_name, date, status, role) FROM stdin;
1	2	Winter Blanket Drive	2024-12-01	Upcoming	Distributor
2	2	Flood Relief Camp	2024-08-15	Completed	Coordinator
\.


--
-- Data for Name: volunteer_certificates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.volunteer_certificates (id, volunteer_id, name, date, issuer) FROM stdin;
1	2	Outstanding Volunteer Award	2023-12-15	NGO Management
2	2	Health Camp Participation	2024-02-20	Medical Team
\.


--
-- Data for Name: volunteer_programs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.volunteer_programs (id, volunteer_id, program_name, schedule, location, status) FROM stdin;
1	2	Weekend Teaching	Saturdays 10 AM - 1 PM	Community Hall, Delhi	Active
\.


--
-- Data for Name: volunteer_updates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.volunteer_updates (id, volunteer_id, title, message, type, created_at) FROM stdin;
\.


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_accounts_id_seq', 1, true);


--
-- Name: campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.campaigns_id_seq', 8, true);


--
-- Name: coordinator_collections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coordinator_collections_id_seq', 2, true);


--
-- Name: coordinator_donors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coordinator_donors_id_seq', 1, true);


--
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.donations_id_seq', 7, true);


--
-- Name: events_news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_news_id_seq', 10, true);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.members_id_seq', 2, true);


--
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partners_id_seq', 1, true);


--
-- Name: programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.programs_id_seq', 4, true);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.resources_id_seq', 25, true);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_members_id_seq', 1, false);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: volunteer_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.volunteer_activities_id_seq', 3, true);


--
-- Name: volunteer_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.volunteer_campaigns_id_seq', 2, true);


--
-- Name: volunteer_certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.volunteer_certificates_id_seq', 2, true);


--
-- Name: volunteer_programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.volunteer_programs_id_seq', 1, true);


--
-- Name: volunteer_updates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.volunteer_updates_id_seq', 1, false);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: coordinator_collections coordinator_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coordinator_collections
    ADD CONSTRAINT coordinator_collections_pkey PRIMARY KEY (id);


--
-- Name: coordinator_donors coordinator_donors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coordinator_donors
    ADD CONSTRAINT coordinator_donors_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: events_news events_news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_news
    ADD CONSTRAINT events_news_pkey PRIMARY KEY (id);


--
-- Name: members members_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_email_key UNIQUE (email);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: volunteer_activities volunteer_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_activities
    ADD CONSTRAINT volunteer_activities_pkey PRIMARY KEY (id);


--
-- Name: volunteer_campaigns volunteer_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_campaigns
    ADD CONSTRAINT volunteer_campaigns_pkey PRIMARY KEY (id);


--
-- Name: volunteer_certificates volunteer_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_certificates
    ADD CONSTRAINT volunteer_certificates_pkey PRIMARY KEY (id);


--
-- Name: volunteer_programs volunteer_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_programs
    ADD CONSTRAINT volunteer_programs_pkey PRIMARY KEY (id);


--
-- Name: volunteer_updates volunteer_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_updates
    ADD CONSTRAINT volunteer_updates_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: coordinator_collections coordinator_collections_coordinator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coordinator_collections
    ADD CONSTRAINT coordinator_collections_coordinator_id_fkey FOREIGN KEY (coordinator_id) REFERENCES public.users(id);


--
-- Name: coordinator_donors coordinator_donors_coordinator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coordinator_donors
    ADD CONSTRAINT coordinator_donors_coordinator_id_fkey FOREIGN KEY (coordinator_id) REFERENCES public.users(id);


--
-- Name: donations donations_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: volunteer_activities volunteer_activities_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_activities
    ADD CONSTRAINT volunteer_activities_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: volunteer_campaigns volunteer_campaigns_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_campaigns
    ADD CONSTRAINT volunteer_campaigns_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: volunteer_certificates volunteer_certificates_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_certificates
    ADD CONSTRAINT volunteer_certificates_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: volunteer_programs volunteer_programs_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_programs
    ADD CONSTRAINT volunteer_programs_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fg9Ml3Dx4JVHAQ8pmQBwDXHGjOXAQXdd8lcvR6WeIRnmvN6qhPgrhH7zeMugKh4

